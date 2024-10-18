import { spawnSync } from "node:child_process";
import { basename } from "node:path";
import { Bumper } from "conventional-recommended-bump";
import { inc } from "semver";

const prefix = `@morpho-org/${basename(process.cwd())}-`;
const bumper = new Bumper().tag({ prefix });

let { releaseType } = await bumper.bump((commits) => {
  if (commits.length === 0) return;

  let level = 2;

  commits.forEach((commit) => {
    if (commit.notes.length > 0) {
      level = 0;
    } else if (commit.type === "feat") {
      if (level === 2) {
        level = 1;
      }
    }
  });

  return { level };
});

if (releaseType) {
  const version =
    (await bumper.gitClient.getVersionFromTags({ prefix })) ?? "1.0.0";

  // const tag = `${prefix}v${version}`;

  const branch = await bumper.gitClient.getCurrentBranch();
  if (branch !== "main") releaseType = "prerelease";

  const newVersion = inc(
    version,
    releaseType,
    branch !== "main" ? branch : undefined,
    "0",
  );

  console.debug(
    `Version bump from ${version} to ${newVersion} on branch ${branch} (release type: ${releaseType})`,
  );

  let { stderr, stdout, error } = spawnSync("pnpm", ["version", newVersion], {
    encoding: "utf8",
  });
  if (error) console.error(error);
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);

  ({ stderr, stdout, error } = spawnSync(
    "pnpm",
    [
      "publish",
      "--no-git-checks",
      "--access",
      "public",
      "--tag",
      branch !== "main" ? branch : "latest",
    ],
    { encoding: "utf8" },
  ));
  if (error) console.error(error);
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);

  const newTag = `${prefix}v${newVersion}`;

  // const genReq = await fetch(
  //   "https://api.github.com/repos/morpho-org/sdks/releases/generate-notes",
  //   {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/vnd.github+json",
  //       Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  //       "X-GitHub-Api-Version": "2022-11-28",
  //     },
  //     body: JSON.stringify({
  //       tag_name: newTag,
  //       target_commitish: branch,
  //       previous_tag_name: tag,
  //     }),
  //   },
  // );

  // if (!genReq.ok) {
  //   console.error(await genReq.text());
  //   process.exit(1);
  // }

  const createReq = await fetch(
    "https://api.github.com/repos/morpho-org/sdks/releases",
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        name: newTag,
        tag_name: newTag,
        target_commitish: branch,
        prerelease: branch !== "main",
        draft: false,
        generate_release_notes: true,
      }),
    },
  );

  if (!createReq.ok) {
    console.error(await createReq.json());
    process.exit(1);
  }
}

process.exit(0);
