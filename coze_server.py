from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from coze import Coze

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 配置API密钥和机器人ID
os.environ['COZE_API_TOKEN'] = "pat_mLVihFnyyZ58yLWBxPFMBHvzuiZm2YFXinufMFB9BgvS9e905VzhT7BhKfrlShpm"

def create_coze_instance(bot_id):
    """创建一个新的Coze实例"""
    os.environ['COZE_BOT_ID'] = bot_id
    return Coze(
        api_token=os.environ['COZE_API_TOKEN'],
        bot_id=os.environ['COZE_BOT_ID']
    )

@app.route('/chat', methods=['POST'])
def handle_chat():
    try:
        data = request.json
        message = data.get('message', '')
        if not message:
            return jsonify({'error': '消息不能为空'}), 400

        # 创建实验评估实例并调用API
        experiment_evaluator = create_coze_instance("7472337468986261538")
        response = experiment_evaluator(message)
        return jsonify({'response': response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-code', methods=['POST'])
def handle_code_generation():
    try:
        data = request.json
        experiment_steps = data.get('message', '')
        if not experiment_steps:
            return jsonify({'error': '实验流程不能为空'}), 400

        # 创建代码生成实例并调用API
        code_generator = create_coze_instance("7473790885332156468")
        response = code_generator(experiment_steps)
        return jsonify({'response': response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)