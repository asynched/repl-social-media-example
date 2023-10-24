type Broker = {
  http: string
  raft: string
}

type Redirection = {
  error: 'ERR_NOT_LEADER'
  leader: string
}

export class REPLClient {
  private leader: Broker

  constructor(private readonly brokers: Broker[]) {
    this.leader = brokers[0]
  }

  private getRandomBroker() {
    return this.brokers[Math.floor(Math.random() * this.brokers.length)]
  }

  async publish(topic: string, message: string) {
    const response = await fetch(`${this.leader.http}/topics/${topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
      }),
    })

    if (response.status === 418) {
      const data: Redirection = await response.json()
      const broker = this.brokers.find((broker) => broker.raft === data.leader)

      if (!broker) {
        throw new Error(`Failed to find broker: ${data.leader}`)
      }

      this.leader = broker

      await this.publish(topic, message)

      return
    }

    if (!response.ok) {
      throw new Error(`Failed to publish message: ${response.statusText}`)
    }
  }

  subscribe(topic: string, callback: (message: string) => void) {
    const broker = this.getRandomBroker()

    const source = new EventSource(`${broker.http}/topics/${topic}/sse`)

    source.addEventListener('message', (event) => callback(event.data))

    return () => source.close()
  }
}

export const repl = new REPLClient([
  {
    http: 'http://127.0.0.1:3000',
    raft: '127.0.0.1:3001',
  },
  {
    http: 'http://127.0.0.1:4000',
    raft: '127.0.0.1:4001',
  },
])
