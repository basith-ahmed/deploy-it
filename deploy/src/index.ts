import { createClient } from "redis";

const subscriber = createClient(); //machine localhost
subscriber.connect();

async function main() {
  while (1) {
    const response = await subscriber.brPop("build-queue", 0);
    console.log("id:", response);
  }
}
main();
