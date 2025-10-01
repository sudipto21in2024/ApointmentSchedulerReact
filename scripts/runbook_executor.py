import pika
import os

RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')
RABBITMQ_QUEUE = os.environ.get('RABBITMQ_QUEUE', 'alerts')

def execute_runbook(service_name):
    print(f"Executing runbook for {service_name}")
    command = f"docker compose restart {service_name}"
    os.system(command)

def callback(ch, method, properties, body):
    print(f"Received {body}")
    service_name = body.decode('utf-8')
    execute_runbook(service_name)

connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
channel = connection.channel()

channel.queue_declare(queue=RABBITMQ_QUEUE)

channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()