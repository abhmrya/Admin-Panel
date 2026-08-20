import time

class RequestTimeMiddleware:

    def __init__(self,get_response):
        self.get_response = get_response

    def __call__(self,request, *args, **kwds):
        
        start_time = time.time()

        '''
        request views me jane se pahle
        ''' 
        print("Request Received: ", request.path)
        print(time)

        response = self.get_response(request)

        '''
        view execute hone ke bad
        '''

        duration = time.time() - start_time

        print("Request took:", duration)

        if request.user.is_authenticated:
            print(
                request.user.email,
                request.method,
                request.path
            )

        return response

    