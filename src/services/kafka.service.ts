import { KafkaClient, Producer } from 'kafka-node';
import util from 'util';

export interface IKafkaService {
  emit: (topic: string, data: Record<string, string>) => Promise<any>;
}

export class KafkaService implements IKafkaService {
  kafkaProducer: Producer;
  constructor() {
    const kafkaClient = new KafkaClient({ kafkaHost: 'kafka:9092' });
    this.kafkaProducer = new Producer(kafkaClient);
  }

  async emit(topic: string, data: any) {
    const send = util.promisify(
      this.kafkaProducer.send.bind(this.kafkaProducer)
    );
    return await send([
      {
        topic,
        messages: JSON.stringify(data),
      },
    ]);
  }
}

export default KafkaService;
