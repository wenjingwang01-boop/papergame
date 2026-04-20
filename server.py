#!/usr/bin/env python3
import socket
import threading
import json
import random
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class GameHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return SimpleHTTPRequestHandler.do_GET(self)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

# 存储房间信息
rooms = {}

def handle_client(client_socket, client_address):
    try:
        while True:
            data = client_socket.recv(4096)
            if not data:
                break
            
            try:
                message = json.loads(data.decode('utf-8'))
                message_type = message.get('type')
                
                if message_type == 'createRoom':
                    room_id = message.get('roomId')
                    player_name = message.get('playerName')
                    
                    if room_id not in rooms:
                        rooms[room_id] = {
                            'players': [],
                            'host': client_address
                        }
                    
                    player = {
                        'id': str(client_address),
                        'name': player_name,
                        'isHost': True
                    }
                    
                    rooms[room_id]['players'].append(player)
                    
                    response = {
                        'type': 'roomCreated',
                        'roomId': room_id,
                        'players': rooms[room_id]['players']
                    }
                    client_socket.send(json.dumps(response).encode('utf-8'))
                    
                    # 广播更新
                    broadcast_update(room_id)
                    
                elif message_type == 'joinRoom':
                    room_id = message.get('roomId')
                    player_name = message.get('playerName')
                    
                    if room_id not in rooms:
                        response = {
                            'type': 'error',
                            'message': '房间不存在'
                        }
                        client_socket.send(json.dumps(response).encode('utf-8'))
                        continue
                    
                    player = {
                        'id': str(client_address),
                        'name': player_name,
                        'isHost': False
                    }
                    
                    rooms[room_id]['players'].append(player)
                    
                    response = {
                        'type': 'roomJoined',
                        'roomId': room_id,
                        'players': rooms[room_id]['players']
                    }
                    client_socket.send(json.dumps(response).encode('utf-8'))
                    
                    # 广播更新
                    broadcast_update(room_id)
                    
                elif message_type == 'startGame':
                    room_id = message.get('roomId')
                    players_data = message.get('players')
                    
                    broadcast_to_room(room_id, {
                        'type': 'gameStarted',
                        'players': players_data
                    })
                    
            except json.JSONDecodeError:
                pass
                
    except Exception as e:
        print(f"客户端错误: {e}")
    finally:
        # 清理断开的连接
        for room_id in list(rooms.keys()):
            room = rooms[room_id]
            players_to_remove = [p for p in room['players'] if p['id'] == str(client_address)]
            
            for player in players_to_remove:
                room['players'].remove(player)
                broadcast_to_room(room_id, {
                    'type': 'playerLeft',
                    'playerName': player['name'],
                    'playerId': player['id']
                })
                broadcast_update(room_id)
                
                if not room['players']:
                    del rooms[room_id]
        
        client_socket.close()

def broadcast_update(room_id):
    if room_id in rooms:
        broadcast_to_room(room_id, {
            'type': 'updatePlayers',
            'players': rooms[room_id]['players']
        })

def broadcast_to_room(room_id, message):
    if room_id in rooms:
        message_str = json.dumps(message).encode('utf-8')
        # 这里简化处理，实际需要维护socket连接列表

def start_socket_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', 3001))
    server.listen(5)
    
    print("Socket服务器运行在端口 3001")
    
    while True:
        client, address = server.accept()
        print(f"客户端连接: {address}")
        client_thread = threading.Thread(target=handle_client, args=(client, address))
        client_thread.daemon = True
        client_thread.start()

def start_http_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(('0.0.0.0', 3000), GameHandler)
    print(f"HTTP服务器运行在 http://localhost:3000")
    print(f"局域网访问地址: http://YOUR_LOCAL_IP:3000")
    print("按 Ctrl+C 停止服务器")
    server.serve_forever()

if __name__ == '__main__':
    # 启动HTTP服务器
    http_thread = threading.Thread(target=start_http_server)
    http_thread.daemon = True
    http_thread.start()
    
    # 启动Socket服务器
    start_socket_server()