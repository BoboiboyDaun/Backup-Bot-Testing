const config = require("../../config.json");

module.exports = (client) => {
    let guilds = client.guilds.cache.size;
    let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
    let channels = client.channels.cache.size;
    let usertag = client.user.tag;
    let username = client.user.username;
    let onlinestatus = 'idle';
  
    const activityNames = [
        { name: `${config.PREFIX}help | Hi I'm ${username}!`, type: 0 },// PLAYING
        { name: `Status 2`, type: 2 }, // LISTENING
        { name: `Status 3`, type: 3 }, // WATCHING
        { name: `Bot Version: v${require("../../package.json").version}`, type: 2 }, // LISTENING
        { name: `${guilds} Servers | ${members} Users | ${channels} Channels ✨`, type: 5 }, // COMPETING
        // Add more custom status here if you needed ✓
    ];

    setInterval(() => { 
        let activity = activityNames[Math.floor(Math.random() * activityNames.length)]; 
        client.user.setActivity(activity.name, { type: activity.type });
    }, 8000); // 1000 = 1 seconds
    client.user.setStatus(onlinestatus);
};

// STATUS ACTIVITY TYPE | 0 = PLAYING | 1 = STREAMING | 2 = LISTENING | 3 = WATCHING | 4 = CUSTOM STATUS | 5 = COMPETING
