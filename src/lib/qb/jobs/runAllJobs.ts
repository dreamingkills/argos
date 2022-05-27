import { Job } from "../../../struct/job";

export async function runAllJobs(jobs: Job[]): Promise<void> {
  const maxSet = jobs.map((j) => j.setId).sort((a, b) => b - a)[0];
  let currentSet = 0;

  while (currentSet < maxSet + 1) {
    await new Promise<void>((res) => {
      let jobsCompleted = 0;

      const jobSet = jobs.filter((j) => j.setId === currentSet);
      for (let job of jobSet) {
        job.addListener("finished", () => {
          jobsCompleted++;
          console.log(jobsCompleted);
          if (jobsCompleted === jobSet.length) res();
        });

        job.run().catch((e) => {
          throw e;
        });
      }
    });
    currentSet++;
  }

  return;
}
