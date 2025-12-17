import { Room, Client } from "colyseus";

export class MyRoom extends Room {
  onCreate (options: any) {
    console.log("MyRoom created!", options);
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room disposed!");
  }
}
