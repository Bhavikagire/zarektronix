const fs = require('fs');
const process = require('process');
const request = require('request');

const likedJokes = {};
const args = process.argv.slice(2);


//API requests function
function fetchJokes(searchTerm, callback) {
  const apiUrl = `https://icanhazdadjoke.com/search?term=${searchTerm}`;
  request({
    url: apiUrl,
    headers: { 'Accept': 'application/json' },
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const jokes = JSON.parse(body).results;
      callback(null, jokes);
    } else {
      callback(error || 'Failed to fetch jokes from the API');
    }
  });
}



if (args.length > 0) {
    const searchTerm = args.join(' ');
    fetchJokes(searchTerm, (error, jokes) => {
      if (error) {
        console.error(error);
      } else {
        displayRandomJoke(jokes);
      }
    });
  } else {
    console.error('Invalid command. Please provide a search term (e.g., node index.js <term>)');
  }

  
// displayRandomjoke function
function displayRandomJoke(jokes) {
    if (jokes.length === 0) {
      console.log("Couldn't find any jokes for the given search term. Maybe the joke gods are on vacation! ✈");
    } else {
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
     
      console.log('✨ Time for a joke that will bring a sweet smile on your face ✨');
      console.log(`⚡ ${randomJoke.joke} ⚡`);
      console.log("*****************************************************************");
  
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
  
      rl.question('Did you like this joke? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          
          likedJokes[randomJoke.joke] = (likedJokes[randomJoke.joke] || 0) + 1;
  
          // Save the liked jokes
          fs.appendFileSync('jokes.txt', `Points: ${likedJokes[randomJoke.joke]} - ${randomJoke.joke}\n`);
        } else {
          console.log('No worries! Maybe the next one will make you laugh.');
        }
  
        rl.close();
      });
    }
  }



//leaderboard show
function displayLeaderboard() {
    console.log('⭐ LEADERBOARD: The Most Popular Jokes ⭐');
  
    
    const jokesContent = fs.readFileSync('jokes.txt', 'utf-8');
    const jokesArray = jokesContent.split('\n');
  
    const likedJokesWithPoints = jokesArray
      .filter(line => line.includes('Points'))
      .map(line => {
        const match = line.match(/Points: (\d+) - (.+)/);
        return { points: Number(match[1]), joke: match[2] };
      });
  
    //map to track unique jokes
    const totalPointsMap = new Map();
  
    // Populate the map with liked jokes 
    likedJokesWithPoints.forEach(jokeInfo => {
      const existingPoints = totalPointsMap.get(jokeInfo.joke) || 0;
      totalPointsMap.set(jokeInfo.joke, existingPoints + jokeInfo.points);
    });
  
    // Sort unique jokes by total points in descending order
    const sortedUniqueJokes = Array.from(totalPointsMap.entries())
      .sort((a, b) => b[1] - a[1]);
  
    // display popular jokes
    for (let i = 0; i < Math.min(sortedUniqueJokes.length, 5); i++) {
      const [joke, totalPoints] = sortedUniqueJokes[i];
      console.log(`#${i + 1}: "${joke}" - ${totalPoints} points`);
    }
    console.log('( ͡• ͜ʖ ͡• ) Keep laughing, and maybe your favorite joke will top the leaderboard next time! ( ͡• ͜ʖ ͡• )');
  }
  
  
  // Check leaderboard keyword
  if (args.includes('leaderboard')) {
    displayLeaderboard();
  }
  