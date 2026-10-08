import { log } from "./log";
import compareVersions from "compare-versions";
import packageJSON from "../package.json";
import { Settings } from "./settings";

// How much time in ms to wait between update checks
const UPDATE_CHECKER_INTERVAL_MS = 1000 * 60 * 60 * 48;
// This fork's releases, not upstream's (dockge.kuma.pet only knows louislam/dockge versions)
const CHECK_URL = "https://api.github.com/repos/Facinorous-420/dockge/releases?per_page=20";

/**
 * Turn a release tag like "v2.0" into a version string, or undefined if it isn't one
 * @param tag Release tag name
 * @returns Version without the leading "v"
 */
function tagToVersion(tag : unknown) : string | undefined {
    if (typeof tag !== "string") {
        return undefined;
    }
    const version = tag.replace(/^v/i, "");
    return /^\d+(\.\d+){0,2}(-[0-9A-Za-z.-]+)?$/.test(version) ? version : undefined;
}

class CheckVersion {
    version = packageJSON.version;
    latestVersion? : string;
    interval? : NodeJS.Timeout;

    async startInterval() {
        const check = async () => {
            if (await Settings.get("checkUpdate") === false) {
                return;
            }

            log.debug("update-checker", "Retrieving latest versions");

            try {
                const res = await fetch(CHECK_URL, {
                    headers: { "Accept": "application/vnd.github+json" },
                });
                if (!res.ok) {
                    throw new Error(`GitHub API returned ${res.status}`);
                }
                const releases = await res.json();

                // Pre-releases count as beta releases
                const checkBeta = await Settings.get("checkBeta");
                let latest : string | undefined;
                for (const release of releases) {
                    if (release.draft || (release.prerelease && !checkBeta)) {
                        continue;
                    }
                    const version = tagToVersion(release.tag_name);
                    if (version && (!latest || compareVersions.compare(version, latest, ">"))) {
                        latest = version;
                    }
                }

                // For debug
                if (process.env.TEST_CHECK_VERSION === "1") {
                    latest = "1000.0.0";
                }

                if (latest) {
                    this.latestVersion = latest;
                }

            } catch (_) {
                log.info("update-checker", "Failed to check for new versions");
            }

        };

        await check();
        this.interval = setInterval(check, UPDATE_CHECKER_INTERVAL_MS);
    }
}

const checkVersion = new CheckVersion();
export default checkVersion;
