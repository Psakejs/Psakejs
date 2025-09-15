const fs = require('fs');
const path = require('path');

// The main function that runs the script
async function updateReadme() {
    const readmePath = path.join(__dirname, 'README.md');
    const activityPath = path.join(__dirname, 'recent_activity.json');

    try {
        // Read the README and the fetched activity data
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        const activityData = JSON.parse(fs.readFileSync(activityPath, 'utf8'));

        // Filter for meaningful events and limit to the 5 most recent
        const recentEvents = activityData
            .filter(event => event.type === 'PushEvent' || event.type === 'CreateEvent' || event.type === 'PullRequestEvent')
            .slice(0, 5);

        // If there are no recent events, stop the script.
        if (recentEvents.length === 0) {
            console.log("No new activity to update. Exiting.");
            return;
        }

        // Generate the new content as a Markdown list
        const activityList = recentEvents.map(event => {
            const repoName = event.repo.name;
            const repoUrl = `https://github.com/${repoName}`;
            let actionText = '';

            if (event.type === 'PushEvent') {
                const commitCount = event.payload.commits.length;
                actionText = `Pushed ${commitCount} commit(s) to`;
            } else if (event.type === 'CreateEvent' && event.payload.ref_type === 'repository') {
                actionText = `Created new repository`;
            } else if (event.type === 'PullRequestEvent' && event.payload.action === 'opened') {
                actionText = `Opened a pull request in`;
            } else {
                return null; // Ignore other event types or actions
            }
            
            return `- ${actionText} [**${repoName}**](${repoUrl})`;
        }).filter(Boolean).join('\n'); // Filter out nulls and join with newlines

        // Use regex to find the placeholder section in the README
        const startMarker = '';
        const endMarker = '';
        const regex = new RegExp(`${startMarker}[\\s\\S]*${endMarker}`);

        // Replace the old list with the new one
        const newReadmeContent = readmeContent.replace(regex, `${startMarker}\n${activityList}\n${endMarker}`);

        // Write the new content back to the README file
        fs.writeFileSync(readmePath, newReadmeContent);
        console.log("README updated successfully with recent activity.");

    } catch (error) {
        console.error("Error updating README:", error);
    }
}

updateReadme();