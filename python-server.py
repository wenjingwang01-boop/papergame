import http.server
import socketserver
import json
import random
import time
from urllib.parse import urlparse, parse_qs
import threading

# 存储房间信息
rooms = {}
rooms_lock = threading.Lock()

def generate_room_id():
    return ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))

class GameHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='.', **kwargs)
    
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
        return super().do_GET()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            path = self.path
            
            if path == '/api/createRoom':
                response = self.create_room(data)
            elif path == '/api/joinRoom':
                response = self.join_room(data)
            elif path == '/api/getRoom':
                response = self.get_room(data)
            elif path == '/api/startGame':
                response = self.start_game(data)
            else:
                response = {'success': False, 'error': 'Not found'}
        except Exception as e:
            print(f"Error: {e}")
            response = {'success': False, 'error': str(e)}
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def create_room(self, data):
        player_name = data.get('playerName', '玩家')
        room_id = generate_room_id()
        
        with rooms_lock:
            rooms[room_id] = {
                'id': room_id,
                'players': [{
                    'id': str(random.randint(10000, 99999)),
                    'name': player_name,
                    'isHost': True
                }],
                'status': 'waiting',
                'createdAt': time.time()
            }
        
        print(f"房间创建: {room_id}, 玩家: {player_name}")
        return {
            'success': True,
            'roomId': room_id,
            'players': rooms[room_id]['players']
        }
    
    def join_room(self, data):
        room_id = data.get('roomId')
        player_name = data.get('playerName', '玩家')
        
        with rooms_lock:
            if room_id not in rooms:
                return {'success': False, 'error': '房间不存在'}
            
            new_player = {
                'id': str(random.randint(10000, 99999)),
                'name': player_name,
                'isHost': False
            }
            
            rooms[room_id]['players'].append(new_player)
        
        print(f"玩家加入: {room_id}, 玩家: {player_name}")
        return {
            'success': True,
            'roomId': room_id,
            'players': rooms[room_id]['players']
        }
    
    def get_room(self, data):
        room_id = data.get('roomId')
        
        with rooms_lock:
            if room_id not in rooms:
                return {'success': False, 'error': '房间不存在'}
            
            return {
                'success': True,
                'room': rooms[room_id]
            }
    
    def start_game(self, data):
        room_id = data.get('roomId')
        
        with rooms_lock:
            if room_id not in rooms:
                return {'success': False, 'error': '房间不存在'}
            
            rooms[room_id]['status'] = 'playing'
        
        print(f"游戏开始: {room_id}")
        return {
            'success': True,
            'players': rooms[room_id]['players']
        }
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def cleanup_old_rooms():
    """清理超过1小时的房间"""
    while True:
        time.sleep(300)  # 每5分钟检查一次
        current_time = time.time()
        with rooms_lock:
            for room_id in list(rooms.keys()):
                if current_time - rooms[room_id].get('createdAt', 0) > 3600:
                    print(f"清理过期房间: {room_id}")
                    del rooms[room_id]

if __name__ == '__main__':
    PORT = 3001
    
    # 启动清理线程
    cleanup_thread = threading.Thread(target=cleanup_old_rooms, daemon=True)
    cleanup_thread.start()
    
    with socketserver.TCPServer(("0.0.0.0", PORT), GameHandler) as httpd:
        print('========================================')
        print('  三组扑克牌游戏服务器已启动')
        print('========================================')
        print('')
        print('本地访问地址:')
        print(f'  http://localhost:{PORT}')
        print('')
        print('局域网访问地址:')
        print(f'  http://YOUR_LOCAL_IP:{PORT}')
        print('')
        print('使用说明:')
        print('1. 主机: 在浏览器打开上述地址，点击"创建房间"')
        print('2. 朋友: 在同一局域网内，打开 http://主机IP:3000')
        print('3. 朋友: 输入房间ID，点击"加入房间"')
        print('4. 主机: 点击"开始游戏"')
        print('')
        print('按 Ctrl+C 停止服务器')
        print('========================================')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n服务器已停止')