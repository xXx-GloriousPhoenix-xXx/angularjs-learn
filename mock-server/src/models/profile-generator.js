const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const cities     = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const allStacks  = ['Python', 'Docker', 'Django', 'TypeScript', 'Angular', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'Go', 'Rust', 'Java', 'Spring', 'MongoDB'];
const descriptions = [
    'The skills list we discussed above is the core of a resume, but it\'s not the only part. You can also tell a little about yourself in the traditional sense — this section can be added to your cover letter.',
    'Passionate developer with a love for clean code and elegant solutions. Always looking for new challenges and opportunities to grow professionally.',
    'Full-stack engineer with experience in building scalable web applications. Open to collaboration and excited about open source projects.',
    'Backend specialist focused on high-performance systems. Enjoy solving complex architectural problems and optimizing database queries.',
    'Frontend enthusiast who cares deeply about UX and accessibility. Believe that great design and great code go hand in hand.',
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset(arr, min = 2, max = 5) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function randomDateWithinLastYears(years = 3) {
    const now = Date.now();
    const past = now - years * 365 * 24 * 60 * 60 * 1000;
    const ts = past + Math.random() * (now - past);
    return new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Random, throwaway profile generator — used for /test_account, /subscribers,
 * /:id, and to seed the search pool. These are NOT persisted by themselves;
 * callers decide whether/where to save the result.
 */
function generateProfile(id) {
    const firstName = randomItem(firstNames);
    const lastName  = randomItem(lastNames);

    return {
        id,
        username:            `${firstName.toLowerCase()}_${lastName.toLowerCase()}${id}`,
        avatarUrl:           `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        subscriptionsAmount: Math.floor(Math.random() * 100),
        firstName,
        lastName,
        description:         randomItem(descriptions),
        isActive:            Math.random() > 0.3,
        stack:               randomSubset(allStacks),
        city:                randomItem(cities),
        registerDate:        randomDateWithinLastYears(),
    };
}

module.exports = {
    generateProfile,
};