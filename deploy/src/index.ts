import { createClient } from "redis";
import { downloadFromS3 } from "./libs/aws";

const subscriber = createClient(); //machine localhost
subscriber.connect();

async function main() {
  while (1) {
    const response = await subscriber.brPop("build-queue", 0);
    if (response) {
      const id = response.element;
      await downloadFromS3(`output/${id}`);
    }
  }
}
main();
