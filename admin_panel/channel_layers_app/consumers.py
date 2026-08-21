from channels.consumer import AsyncConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async
import json


class OnlineStatusConsumer(AsyncConsumer):

    async def websocket_connect(self, event):
        self.room_group_name = "online_users"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.send({"type": "websocket.accept"})

    async def websocket_receive(self, event):
        data = json.loads(event["text"])
        username = data["username"]
        connection_type = data["type"]

        await self.change_online_status(username, connection_type)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "send_online_status",
                "value": json.dumps({
                    "username": username,
                    "status": connection_type == "open"
                })
            }
        )

    async def send_online_status(self, event):
        await self.send({"type": "websocket.send", "text": event["value"]})

    async def websocket_disconnect(self, event):
        await self.change_online_status_offline()
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        raise StopConsumer()

    @database_sync_to_async
    def change_online_status(self, username, c_type):
        from django.contrib.auth import get_user_model
        from .models import UserProfile
        User = get_user_model()

        user = User.objects.get(username=username)
        userprofile, _ = UserProfile.objects.get_or_create(user=user)
        userprofile.online = (c_type == "open")
        userprofile.save()

    @database_sync_to_async
    def change_online_status_offline(self):
        from .models import UserProfile
        try:
            user = self.scope["user"]
            if user.is_authenticated:
                userprofile, _ = UserProfile.objects.get_or_create(user=user)
                userprofile.online = False
                userprofile.save()
        except Exception:
            pass


class MyAsyncConsumer(AsyncConsumer):

    async def websocket_connect(self, event):
        self.groupname = self.scope["url_route"]["kwargs"]["group_name"].replace(" ", "_")
        await self.channel_layer.group_add(self.groupname, self.channel_name)
        await self.send({"type": "websocket.accept"})

    async def websocket_receive(self, event):
        from .models import Group_name, Chat_msg

        data = json.loads(event["text"])
        data["user"] = self.scope["user"].username

        if data.get("msg"):
            user = self.scope["user"]
            group = await database_sync_to_async(Group_name.objects.get)(groupname=self.groupname)
            chat = Chat_msg(user=user, group=group, message=data["msg"])
            await database_sync_to_async(chat.save)()

        await self.channel_layer.group_send(
            self.groupname,
            {"type": "chat.message", "message": json.dumps(data)},
        )

    async def chat_message(self, event):
        await self.send({"type": "websocket.send", "text": event["message"]})

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(self.groupname, self.channel_name)
        raise StopConsumer()


class OneToOneAsyncConsumer(AsyncConsumer):

    async def websocket_connect(self, event):
        self.send_to_user = self.scope["url_route"]["kwargs"]["user_name"]
        users = sorted([self.scope["user"].username, self.send_to_user])
        self.chat_channel = f"one_to_one_{users[0]}_{users[1]}"

        await self.channel_layer.group_add(self.chat_channel, self.channel_name)
        await self.send({"type": "websocket.accept"})

    async def websocket_receive(self, event):
        from django.contrib.auth import get_user_model
        from .models import OneToOneMessage
        User = get_user_model()

        data = json.loads(event["text"])
        data["user"] = self.scope["user"].username
        data["receiver"] = self.send_to_user
        data["notification"] = True

        user = self.scope["user"]
        send_to = await database_sync_to_async(User.objects.get)(username=self.send_to_user)

        message = OneToOneMessage(send_from=user, send_to=send_to, message=data["msg"])
        await database_sync_to_async(message.save)()

        await self.channel_layer.group_send(
            self.chat_channel,
            {"type": "chat.message", "message": json.dumps(data)}
        )

    async def chat_message(self, event):
        await self.send({"type": "websocket.send", "text": event["message"]})

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(self.chat_channel, self.channel_name)
        raise StopConsumer()