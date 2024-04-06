import json
from uuid import uuid4
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Player

games = []
user_groups = {}

ERROR_MESSAGES = {
    "not_ex": "game does not exist", 
    'full': "game already full"
}

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(dir(self))
        self.game_uuid = self.scope["path"].strip("/")
        self.user_uuid = self.scope["query_string"].decode("utf-8")
        try:
            Player.validate_uuid(self.user_uuid)
            await self.accept()
        except ValueError:
            await self.close()

    async def disconnect(self, close_code):
        pass

    
    async def receive(self, text_data):
        pass

            
    async def game_info(self, event):
        pass




class QueryConsumer(AsyncWebsocketConsumer):

    def generate_error_message(self, text):
        template = {
                    "type": "game_info",
                    "message": {
                        "phaseOfGame": "error",
                        "message": {"category": "result", "content": text, "points": None}}}
        return template
    
    def generate_status_message(self, game, status=None):
        template = {"type": "game_info", "message": {"phaseOfGame": status or game.status, "multiPlayer": game.multiplayer}}
        return template


    async def connect(self):
        self.temp_user_group = None
        await self.accept()
    
    async def receive(self, text_data):
        message = json.loads(text_data)
        requested_game_id = message.get("gameId")
        filtered_games = list(filter(lambda game: game.uuid == requested_game_id, games))
        [requested_game, all_player_uuids, requesting_player_uuid, plays_game] = [None for i in range(4)]
        self.temp_user_group = "group_" + str(uuid4())
        
        await self.channel_layer.group_add(self.temp_user_group, self.channel_name)
        
        if filtered_games:
            requested_game = filtered_games[0]
            all_player_uuids = [p.uuid for p in requested_game.players]
            requesting_player_uuid = message.get("player1Id")
            plays_game = requesting_player_uuid in all_player_uuids
            
            if not requested_game.multiplayer and not plays_game:
                await self.channel_layer.group_send(
                    self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["full"]))
            elif len(requested_game.players) > 1 and not plays_game:
                await self.channel_layer.group_send(
                    self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["full"]))
            elif requested_game.multiplayer and not plays_game:
                await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(requested_game, status="joining"))
            else:
                await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(requested_game))
        else:
            await self.channel_layer.group_send(
                self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["not_ex"]))

        
    async def disconnect(self, close_code):
        if self.temp_user_group:
            await self.channel_layer.group_discard(self.temp_user_group, self.channel_name)

    async def game_info(self, event):
        message =  json.dumps(event["message"])
        await self.send(text_data=message)

