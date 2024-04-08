import { execSync } from "child_process";

const VersionTypes = {
  0: "patch",
  1: "minor",
  2: "major",
};

const VersionCommitMessage = /^v\d.\d.\d$/;

async function main() {
  const commits = execSync("git log --pretty=%H,%s", {
    encoding: "utf-8",
  })
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [sha, message] = line.split(",");
      return { sha, message };
    });

  const [newCommit, ...restCommits] = commits;

  if (newCommit.message.match(VersionCommitMessage)) {
    console.info("Current version is already bumped");
    return;
  }

  let versionType = 0;

  for (const commit of restCommits) {
    const { sha, message } = commit;

    if (message.match(VersionCommitMessage)) {
      console.info("Found version bump commit: ", sha);
      break;
    }

    if (message.match(/^(fix):/) && versionType <= 0) {
      versionType = 0;
    }

    if (message.match(/^(refactor|minor|chore):/) && versionType < 1) {
      versionType = 1;
    }

    if (message.match(/^(.*)!:/) && versionType < 2) {
      versionType = 2;
    }
  }

  console.info("Bumping version with type: ", VersionTypes[versionType]);
  execSync(`npm version ${VersionTypes[versionType]} -m "v%s"`);
}

void main();
