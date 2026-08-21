# from channels.consumer import SyncConsumer, AsyncConsumer
# from channels.exceptions import StopConsumer
# from time import sleep
# import asyncio
# import json
# from asgiref.sync import async_to_sync
# from . models import Group_name, Chat_msg,OneToOneMessage, UserProfile
# from channels.db import database_sync_to_async
# from django.contrib.auth.models import User

# class OnlineStatusConsumer(AsyncConsumer):
#     async def websocket_connect(self, event):
#         self.room_group_name = "online_users"
#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.send({
#             'type': 'websocket.accept'
#         })
#     async def websocket_receive(self, event):
#         print("text========", event)
#         data = json.loads(event['text'])
#         username = data['username']
#         connection_type = data['type']
#         print('connection_type---------->',connection_type)
#         await self.change_online_status(username, connection_type)

#     async def send_onlineStatus(self, event):
#         # data = json.loads(event.get('value'))
#         # username = data['username']
#         # online_status = data['status']
#         # print(online_status)
#         await self.send({'type':'websocket.send',
#                 'text': event['value'],}
#             # {'username':username, 'online_status':online_status}
#         )

#     async def websocket_disconnect(self, event):
#         # await self.change_online_status(self.scope['user'].username, 'offline')
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
#         raise StopConsumer()

#     @database_sync_to_async
#     def change_online_status(self, username, c_type):
#         user = User.objects.get(username=username)
#         userprofile, created = UserProfile.objects.get_or_create(user=user)  # ✅ safe
#         if c_type == 'open':
#             userprofile.online = True
#         else:
#             userprofile.online = False
#         userprofile.save()




#         # user_profile, created = await self.get_or_create_user_profile()
#         # user_profile.online = False 
#         # await user_profile.save()

    



# class MyAsyncConsumer(AsyncConsumer):
#     async def websocket_connect(self, event):
#         self.groupname = self.scope["url_route"]["kwargs"]["group_name"]
#         await self.channel_layer.group_add(self.groupname, self.channel_name)
#         await self.send({"type": "websocket.accept"})

#     async def websocket_receive(self, event):
#         data = json.loads(event["text"])
#         data["user"] = self.scope["user"].username

#         # ✅ Only save messages here (text only)
#         if data.get("msg"):
#             user = self.scope["user"]
#             group = await database_sync_to_async(Group_name.objects.get)(
#                 groupname=self.groupname
#             )
#             chat = Chat_msg(user=user, group=group, message=data["msg"])
#             await database_sync_to_async(chat.save)()

#         # Broadcast msg/audio to group
#         await self.channel_layer.group_send(
#             self.groupname,
#             {
#                 "type": "chat.message",
#                 "message": json.dumps(data),
#             },
#         )

#     async def chat_message(self, event):
#         await self.send(
#             {
#                 "type": "websocket.send",
#                 "text": event["message"],
#             }
#         )

#     async def websocket_disconnect(self, event):
#         await self.channel_layer.group_discard(self.groupname, self.channel_name)
#         raise StopConsumer()




# class OneToOneAsyncConsumer(AsyncConsumer):
#     async def websocket_connect(self, event):
        
#         self.send_to_user = self.scope['url_route']['kwargs']['user_name']
#         print("==========", self.send_to_user)
#         print("user name ==========", self.scope['user'].username)
#         users = [self.scope['user'].username, self.send_to_user]
#         users.sort()  # Sort the usernames alphabetically
#         self.chat_channel = f"one_to_one_{users[0]}_{users[1]}"
#         # self.chat_channel = f"one_to_one_{self.scope['user'].username}_{self.send_to_user}"
#         print("chat==========",self.chat_channel)
#         # print("scope", self.scope)
#         await self.channel_layer.group_add(self.chat_channel, self.channel_name)
#         # self.accept()
#         await self.send({
#             'type':'websocket.accept'
#         })

#     async def websocket_receive(self, event):
#         print("websocket received...", event)
#         data = json.loads(event['text'])
#         data['user'] = self.scope['user'].username
#         data['receiver'] = self.send_to_user
#         data['notification'] = True

        
#         user = self.scope['user']
#         self.send_to_user = self.scope['url_route']['kwargs']['user_name']
#         send_to = await database_sync_to_async(User.objects.get)(username=self.send_to_user)
#         print("grouppppppppp",send_to)
#         message = OneToOneMessage(send_from=user,send_to=send_to,message=data['msg'])
#         await database_sync_to_async(message.save)()
#         await self.channel_layer.group_send(
#             self.chat_channel,
#             {
#                 'type':'chat.message',
#                 # 'message': event['text']
#                 'message': json.dumps(data)

#             }
#         )
#     async def chat_message(self, event):
#         print("event.......",event)
#         await self.send( {
#                 'type':'websocket.send',
#                 'text': event['message'],
#             })
        
#     async def websocket_disconnect(self, event):
#         print("websocket disconnect...", event)
#         print("channel name...", self.channel_name)
#         await self.channel_layer.group_discard(self.chat_channel,self.channel_name)

#         raise StopConsumer()
    
from channels.consumer import AsyncConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async
import json


# ══════════════════════════════════════════════
#  ONLINE STATUS
# ══════════════════════════════════════════════
class OnlineStatusConsumer(AsyncConsumer):

    async def websocket_connect(self, event):
        self.room_group_name = "online_users"
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.send({"type": "websocket.accept"})

    async def websocket_receive(self, event):
        data = json.loads(event["text"])
        username = data["username"]
        connection_type = data["type"]

        await self.change_online_status(username, connection_type)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                # ✅ FIX: type name must match method name exactly
                # send_online_status → def send_online_status
                "type": "send_online_status",
                "value": json.dumps({
                    "username": username,
                    "status": connection_type == "open"
                })
            }
        )

    # ✅ FIX: renamed from send_onlineStatus → send_online_status
    # Channels converts "send_online_status" type → calls this method
    async def send_online_status(self, event):
        await self.send({
            "type": "websocket.send",
            "text": event["value"]
        })

    async def websocket_disconnect(self, event):
        await self.change_online_status_offline()
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )
        raise StopConsumer()

    @database_sync_to_async
    def change_online_status(self, username, c_type):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        from .models import UserProfile
        user = User.objects.get(username=username)
        userprofile, _ = UserProfile.objects.get_or_create(user=user)
        userprofile.online = (c_type == "open")
        userprofile.save()

    @database_sync_to_async
    def change_online_status_offline(self):
        # Mark user offline on disconnect (e.g. tab close without beforeunload)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        from .models import UserProfile
        try:
            user = self.scope["user"]
            if user.is_authenticated:
                userprofile, _ = UserProfile.objects.get_or_create(user=user)
                userprofile.online = False
                userprofile.save()
        except Exception:
            pass


# ══════════════════════════════════════════════
#  GROUP CHAT
# ══════════════════════════════════════════════
class MyAsyncConsumer(AsyncConsumer):

    async def websocket_connect(self, event):
        self.groupname = self.scope["url_route"]["kwargs"]["group_name"]
        self.groupname = self.groupname.replace(" ", "_") 
        await self.channel_layer.group_add(self.groupname, self.channel_name)
        await self.send({"type": "websocket.accept"})

    async def websocket_receive(self, event):
        from .models import Group_name, Chat_msg

        data = json.loads(event["text"])
        data["user"] = self.scope["user"].username

        # Save text message to DB
        if data.get("msg"):
            user = self.scope["user"]
            group = await database_sync_to_async(
                Group_name.objects.get
            )(groupname=self.groupname)
            chat = Chat_msg(user=user, group=group, message=data["msg"])
            await database_sync_to_async(chat.save)()

        # Broadcast to group
        await self.channel_layer.group_send(
            self.groupname,
            {
                "type": "chat.message",
                "message": json.dumps(data),
            },
        )

    async def chat_message(self, event):
        await self.send({
            "type": "websocket.send",
            "text": event["message"],
        })

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(self.groupname, self.channel_name)
        raise StopConsumer()


# ══════════════════════════════════════════════
#  ONE-TO-ONE CHAT
# ══════════════════════════════════════════════
class OneToOneAsyncConsumer(AsyncConsumer):

    async def websocket_connect(self, event):
        self.send_to_user = self.scope["url_route"]["kwargs"]["user_name"]

        # Sort usernames so both sides get same channel name
        users = sorted([self.scope["user"].username, self.send_to_user])
        self.chat_channel = f"one_to_one_{users[0]}_{users[1]}"

        await self.channel_layer.group_add(self.chat_channel, self.channel_name)
        await self.send({"type": "websocket.accept"})

    async def websocket_receive(self, event):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        
        from .models import OneToOneMessage

        data = json.loads(event["text"])
        data["user"] = self.scope["user"].username
        data["receiver"] = self.send_to_user
        data["notification"] = True

        user = self.scope["user"]
        send_to = await database_sync_to_async(
            User.objects.get
        )(username=self.send_to_user)

        message = OneToOneMessage(
            send_from=user,
            send_to=send_to,
            message=data["msg"]
        )
        await database_sync_to_async(message.save)()

        await self.channel_layer.group_send(
            self.chat_channel,
            {
                "type": "chat.message",
                "message": json.dumps(data)
            }
        )

    async def chat_message(self, event):
        await self.send({
            "type": "websocket.send",
            "text": event["message"]
        })

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(self.chat_channel, self.channel_name)
        raise StopConsumer()
