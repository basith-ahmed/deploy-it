import { createClient } from "redis";
import { downloadFromS3, uploadFinalDistToS3 } from "./libs/aws";
import { buildProject } from "./libs/build";

const subscriber = createClient(); //machine localhost
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
  while (1) {
    const response = await subscriber.brPop("build-queue", 0);
    if (response) {
      const id = response.element;

      publisher.hSet("status", id, "building");
      await downloadFromS3(`output/${id}`);
      await buildProject(id);
      await uploadFinalDistToS3(id);
      publisher.hSet("status", id, "deployed")
    }
  }
}
main();
