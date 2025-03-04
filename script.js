
document.addEventListener("DOMContentLoaded", () => {
    fetch("data.csv")
        .then(response => response.text())
        .then(text => {
            const rows = text.split("\n").filter(row => row.trim() !== "").map(row => row.split(",").map(cell => (cell ? cell.trim() : "")));
            
            // extract header and data rows
            if (rows.length < 2) {
                return;
            }
            
            const [header, ...data] = rows;
            //const hintElement = document.getElementById("hint");
            const answerInput = document.getElementById("answerInput");
            const dataList = document.getElementById("answers");
            const rankTableBody = document.getElementById("rankTable").querySelector("tbody");
            const hintsTableBody = document.getElementById("hintsTable").querySelector("tbody");
            const feedbackElement = document.getElementById("feedback");
            const resultsContainer = document.getElementById("resultsContainer");
            //const resultsMessageElement = document.getElementById("resultsMessage");
            const ratingElement = document.getElementById("rating");
            const resultImageElement = document.getElementById("resultImage");
            const resultImagePopup = document.getElementById("resultImagePopup");
            const resultImagePopupImg = resultImagePopup.querySelector("img");
            const dropdownMessage = document.getElementById("dropdownMessage");
            const newGameButton = document.getElementById("newGame");
            const currentDateElement = document.getElementById("currentDate");
            //const smashBallImage = document.getElementById("smashBallImage");
            //const randomButton = document.getElementById("randomButton");
            const streakText = document.getElementById("streakText");
            
            // hash function to determine the index based on the date
            function hashDate(date) {
                const dateString = date.toDateString();
                let hash = 0;
                for (let i = 0; i < dateString.length; i++) {
                    const char = dateString.charCodeAt(i);
                    hash = (hash << 5) - hash + char;
                    hash |= 0; // convert to 32bit integer
                }
                return Math.abs(hash) % data.length;
            }
            
            // determine today's index using the hash function
            const todayIndex = hashDate(new Date());
            const todayRow = data[todayIndex] || [];
            
            // ensure the row has enough columns before accessing
            if (todayRow.length < 7) {
                return;
            }
            
            let currentRow = todayRow; // track the current row being used
            console.log(todayRow); //for cheating
            // set initial hints for today
            const hintCategories = ["PR Season:", "Most Recent Appearance:", "First Appearance:", "Appearances:"];
            const hintValues = [todayRow[1], "", "", ""];
            hintCategories.forEach((category, index) => {
                const hintRow = document.createElement("tr");
                const hintTd = document.createElement("td");
                const guessTd = document.createElement("td");
                hintTd.innerHTML = `<strong>${category}</strong> ${hintValues[index]}`;
                guessTd.textContent = "";
                hintRow.appendChild(hintTd);
                hintRow.appendChild(guessTd);
                hintsTableBody.appendChild(hintRow);
            });
            
            // set the first hint cell to always be purple and apply flip animation
            const firstHintCell = hintsTableBody.rows[0].cells[0];
            firstHintCell.classList.add("hint-revealed");
            applyFlipAnimation(firstHintCell, "rgba(128, 0, 128, 0.7)");
            
            // populate dropdown with unique answers in alphabetical order (case insensitive)
            const uniqueAnswers = [...new Set(data.map(row => row[3]).filter(Boolean))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            uniqueAnswers.forEach(answer => {
                const option = document.createElement("option");
                option.value = answer;
                dataList.appendChild(option);
            });

            // populate rank table with ranks only
            function populateRankTable(row) {
                const sameNumberRows = data.filter(dataRow => dataRow[0] === row[0]);
                rankTableBody.innerHTML = ""; // clear existing rows
                sameNumberRows.forEach(dataRow => {
                    const tr = document.createElement("tr");
                    const rankTd = document.createElement("td");
                    const tagTd = document.createElement("td");
                    const hintTd = document.createElement("td");
                    
                    rankTd.textContent = dataRow[2];
                    tagTd.textContent = "";
                    hintTd.textContent = "";
                    
                    tr.appendChild(rankTd);
                    tr.appendChild(tagTd);
                    tr.appendChild(hintTd);
                    rankTableBody.appendChild(tr);
                });
            }
            
            populateRankTable(todayRow);
            
            let guessCount = 0;
            const maxGuesses = 4;
            const hints = [
                { category: "Most Recent Appearance:", hint: todayRow[4] },
                { category: "First Appearance:", hint: todayRow[5] },
                { category: "Appearances:", hint: todayRow[6] }
            ];

            // helper functions for cookies
            function setCookie(name, value, days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                const expires = "expires=" + date.toUTCString();
                document.cookie = name + "=" + value + ";" + expires + ";path=/";
            }

            function getCookie(name) {
                const nameEQ = name + "=";
                const ca = document.cookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
                }
                return null;
            }

            // check if the user has already guessed today
            // const lastGuessDate = localStorage.getItem("lastGuessDate");
            // const cookieLastGuessDate = getCookie("lastGuessDate");
            // const today = new Date().toDateString();
            // if (lastGuessDate === today || cookieLastGuessDate === today) {
            //     feedbackElement.textContent = "you have already guessed today. please come back tomorrow.";
            //     answerInput.disabled = true;
            //     return;
            // }

            window.validateInput = function () {
                const userGuess = answerInput.value.trim().toLowerCase();
                const isValid = uniqueAnswers.map(answer => answer.toLowerCase()).includes(userGuess);
                document.getElementById("submitButton").disabled = !isValid && uniqueAnswers.length !== 1;
                dropdownMessage.style.display = "none";
            };
            
            window.submitGuess = function () {
                const userGuess = uniqueAnswers.length === 1 ? uniqueAnswers[0] : answerInput.value.trim().toLowerCase();
                if (!uniqueAnswers.map(answer => answer.toLowerCase()).includes(userGuess)) {
                    dropdownMessage.style.display = "block";
                    return;
                }
                
                if (guessCount >= maxGuesses) {
                    showResults(false, guessCount);
                    submitButton.disabled = true;
                    return;
                }
                
                const correctAnswer = currentRow[3].toLowerCase();
                
                if (userGuess === correctAnswer) {
                    // localStorage.setItem("lastGuessDate", today);
                    // setCookie("lastGuessDate", today, 1);
                    localStorage.setItem("correctAnswerTag", currentRow[3]);
                    showResults(true, guessCount, correctAnswer, maxGuesses, currentRow);
                    return;
                }
                
                // find the guessed row
                const guessedRow = data.find(row => row[3].toLowerCase() === userGuess && row[0] === currentRow[0]);
                if (guessedRow) {
                    const correctRank = currentRow[2] === "HM" ? 30 : currentRow[2] === "IM" ? 31 : parseInt(currentRow[2], 10);
                    const guessedRank = guessedRow[2] === "HM" ? 30 : guessedRow[2] === "IM" ? 31 : parseInt(guessedRow[2], 10);
                    
                    // update the table with the guessed tag and arrow
                    const rowIndex = data.filter(row => row[0] === currentRow[0]).indexOf(guessedRow);
                    if (rowIndex !== -1 && rankTableBody.rows[rowIndex]) {
                        const rankCell = rankTableBody.rows[rowIndex].cells[0];
                        const tagCell = rankTableBody.rows[rowIndex].cells[1];
                        const hintCell = rankTableBody.rows[rowIndex].cells[2];
                        
                        tagCell.textContent = guessedRow[3];
                        if (guessedRank > correctRank) {
                            hintCell.innerHTML = "&#x21e7;"; // up arrow
                        } else if (guessedRank < correctRank) {
                            hintCell.innerHTML = "&#x21e9;"; // down arrow
                        } else {
                            hintCell.textContent = "=";
                        }
                        hintCell.classList.add("relation-arrow");
                        applyFlipAnimation(rankCell, rankCell.style.backgroundColor, () => {
                            rankCell.style.backgroundColor = rankCell.style.getPropertyValue('--flip-color');
                            rankTableBody.rows[rowIndex].classList.add("correct-rank");
                        });
                        applyFlipAnimation(hintCell, hintCell.style.backgroundColor, () => {
                            hintCell.style.backgroundColor = hintCell.style.getPropertyValue('--flip-color');
                        });
                        applyFlipAnimation(tagCell, tagCell.style.backgroundColor, () => {
                            tagCell.style.backgroundColor = tagCell.style.getPropertyValue('--flip-color');
                        });
                    }
                    
                    // add the correct guess to the guesses column with orange background
                    const guessCell = hintsTableBody.rows[guessCount].cells[1];
                    guessCell.textContent = guessedRow[3];
                    guessCell.classList.add("correct-rank");
                    applyFlipAnimation(guessCell, "rgba(255, 191, 0, 0.7)", () => {
                        guessCell.style.backgroundColor = guessCell.style.getPropertyValue('--flip-color');
                    });
                    
                } else {
                    // add the wrong guess to the guesses column with red background
                    const guessCell = hintsTableBody.rows[guessCount].cells[1];
                    const guessedTag = data.find(row => row[3].toLowerCase() === userGuess);
                    guessCell.textContent = guessedTag ? guessedTag[3] : userGuess;
                    guessCell.classList.add("wrong-answer");
                    applyFlipAnimation(guessCell, "rgba(255, 0, 0, 0.7)", () => {
                        guessCell.style.backgroundColor = guessCell.style.getPropertyValue('--flip-color');
                    });
                }
                
                // reveal a hint
                if (guessCount < hints.length) {
                    const hintRow = hintsTableBody.rows[guessCount + 1]; // skip the first row
                    const hintTd = hintRow.cells[0];
                    hintTd.innerHTML = `<strong>${hints[guessCount].category}</strong> ${hints[guessCount].hint}`;
                    hintTd.classList.add("hint-revealed");
                    applyFlipAnimation(hintTd, "rgba(128, 0, 128, 0.7)", () => {
                        hintTd.style.backgroundColor = hintTd.style.getPropertyValue('--flip-color');
                    });
                }
                
                // remove a falco image
                const falcoImages = document.querySelectorAll(".falco-image");
                if (falcoImages.length > 0) {
                    falcoImages[falcoImages.length - 1].remove();
                }
                
                guessCount++;
                if (guessCount >= maxGuesses) {
                    // localStorage.setItem("lastGuessDate", today);
                    // setCookie("lastGuessDate", today, 1);
                    
                    showResults(false, guessCount, correctAnswer, maxGuesses, currentRow);
                }
    };
            
            
            function showResults(success, guessCount, correctAnswer) {
                resultsContainer.style.display = "flex";
                //Move remaining Falco images to the results box before clearing the rating container
                const resultsFalcoImages = document.getElementById("resultsFalcoImages");
                resultsFalcoImages.innerHTML = ""; // Clear any existing images
                const remainingFalcoImages = document.querySelectorAll("#rating .falco-image");
                console.log("Remaining Falco images:", remainingFalcoImages.length); // Log the number of remaining Falco images
                remainingFalcoImages.forEach(img => {
                resultsFalcoImages.appendChild(img);
                });

                ratingElement.innerHTML = "";
                const rating = success ? maxGuesses - guessCount : 0;
                console.log("showResults-success: ", success);
                for (let i = 0; i < rating; i++) {
                    const img = document.createElement("img");
                    img.src = "images/Falco_SSBM.png";
                    img.classList.add("falco-image");
                    ratingElement.appendChild(img);
                }

                // display the result image
                const imageName = currentRow[7];
                if (imageName) {
                    resultImageElement.src = `images/PRGraphics/${imageName}`;
                    resultImageElement.style.display = "block";
                    resultImageElement.addEventListener("click", () => {
                        resultImagePopup.style.display = "flex";
                        resultImagePopupImg.src = resultImageElement.src;
                        resultImagePopup.classList.add("grow");
                    });
                } else {
                    resultImageElement.style.display = "none";
                }

                // preserve existing styles and arrows
                const preservedRows = Array.from(rankTableBody.rows).map(row => {
                    const clonedRow = row.cloneNode(true);
                    clonedRow.className = row.className;
                    return clonedRow;
                });

                // populate the rank table with the correct ranks and tags
                rankTableBody.innerHTML = ""; // clear existing rows
                const sameNumberRows = data.filter(row => row[0] === currentRow[0]);
                sameNumberRows.forEach((dataRow, index) => {
                    const tr = preservedRows[index] || document.createElement("tr");
                    const rankTd = tr.cells[0] || document.createElement("td");
                    const tagTd = tr.cells[1] || document.createElement("td");
                    const hintTd = tr.cells[2] || document.createElement("td");
                    
                    rankTd.textContent = dataRow[2];
                    tagTd.textContent = dataRow[3];
                    hintTd.innerHTML = preservedRows[index] ? preservedRows[index].cells[2].innerHTML : "";
                    
                    if (!tr.cells[0]) tr.appendChild(rankTd);
                    if (!tr.cells[1]) tr.appendChild(tagTd);
                    if (!tr.cells[2]) tr.appendChild(hintTd);
                    rankTableBody.appendChild(tr);
                });

                // highlight the correct answer row
                const correctRowIndex = sameNumberRows.findIndex(row => row[3].toLowerCase() === correctAnswer);
                if (correctRowIndex !== -1) {
                    applyFlipAnimation(rankTableBody.rows[correctRowIndex], rankTableBody.rows[correctRowIndex].style.backgroundColor, () => {
                        rankTableBody.rows[correctRowIndex].style.backgroundColor = success ? "rgba(0, 255, 0, 0.7)" : "rgba(255, 0, 0, 0.7)";
                    });
                }

                // show the "continue?" button
                newGameButton.style.display = "block";


                // Add the correct answer tag and season for random puzzles
                if (currentDateElement.textContent === "RANDOM") {
                    console.log("streak: ", localStorage.getItem("streak"));

                    // Retrieve existing arrays
                    let streakArrayTags = JSON.parse(localStorage.getItem("streakArrayTags")) || [];
                    let streakArraySeasons = JSON.parse(localStorage.getItem("streakArraySeasons")) || [];
                
                    // Convert streak to a number (default to 0 if null)
                    let streakIndex = parseInt(localStorage.getItem("streak"), 10) || 0;
                
                    // Append the new correct answer
                    streakArrayTags.push(currentRow[3]);
                    streakArraySeasons.push(currentRow[1]);
                
                    // Store updated arrays back in localStorage
                    localStorage.setItem("streakArrayTags", JSON.stringify(streakArrayTags));
                    localStorage.setItem("streakArraySeasons", JSON.stringify(streakArraySeasons));
                
                    console.log("Updated streakArrayTags:", localStorage.getItem("streakArrayTags"));
                    console.log("Updated streakArraySeasons:", localStorage.getItem("streakArraySeasons"));
                
                    // Update streak count in localStorage
                    localStorage.setItem("streak", streakIndex + 1);
                }

                // Show the today's results box if today's puzzle is finished
                console.log(currentDateElement.textContent);
                if (currentDateElement.textContent !== "RANDOM") {
                    console.log("showResults-success: ", success);
                    return toggleTodaysResultsBox(success), success;
                }else{
                    console.log("showResults-success: ", success);
                    return toggleRandomResultsBox(success), updateStreak(success), success;
                    
                }
                
            }

            window.randomGame = function(success) {
                const currentTime = Date.now(); // current time in milliseconds
                const randomIndex = currentTime % data.length;
                const randomRow = data[randomIndex] || [];

                //reenable the submit button when a puzzle is started
                const submitButton = document.getElementById("submitButton");
                submitButton.disabled = false;

                console.log("randomGame-success: ", success);

                // ensure the row has enough columns before accessing
                if (randomRow.length < 7) {
                    return;
                }

                // clear existing hints and rank table
                hintsTableBody.innerHTML = "";
                rankTableBody.innerHTML = "";

                // set initial hints for the random puzzle
                const hintValues = [randomRow[1], "", "", ""];
                hintCategories.forEach((category, index) => {
                    const hintRow = document.createElement("tr");
                    const hintTd = document.createElement("td");
                    const guessTd = document.createElement("td");
                    hintTd.innerHTML = `<strong>${category}</strong> ${hintValues[index]}`;
                    guessTd.textContent = "";
                    hintRow.appendChild(hintTd);
                    hintRow.appendChild(guessTd);
                    hintsTableBody.appendChild(hintRow);
                });
                console.log(randomRow); //for cheating
                // set the first hint cell to always be purple and apply flip animation
                const firstHintCell = hintsTableBody.rows[0].cells[0];
                firstHintCell.classList.add("hint-revealed");
                applyFlipAnimation(firstHintCell, "rgba(128, 0, 128, 0.7)");

                // populate rank table with ranks and blank tags for the random puzzle
                populateRankTable(randomRow);

                // reset guess count and other elements
                guessCount = 0;
                feedbackElement.textContent = ""; // Clear any existing feedback messages
                resultsContainer.style.display = "none";
                resultImageElement.style.display = "none";
                newGameButton.style.display = "none"; // hide the button until the puzzle is solved

                // update the title to "RANDOM"
                currentDateElement.textContent = "RANDOM";

                currentRow = randomRow; // update the current row to the random row

                // reset falco images
                ratingElement.innerHTML = "";
                for (let i = 0; i < maxGuesses; i++) {
                    const img = document.createElement("img");
                    img.src = "images/Falco_SSBM.png";
                    img.classList.add("falco-image");
                    ratingElement.appendChild(img);
                }

                // update hints for the random puzzle
                hints.length = 0;
                hints.push(
                    { category: "Most Recent Appearance:", hint: randomRow[4] },
                    { category: "First Appearance:", hint: randomRow[5] },
                    { category: "Appearances:", hint: randomRow[6] }
                );

                // Replace the random button with the Smash Ball image and show the streak text
                document.getElementById("randomButton").style.display = "none";
                document.getElementById("smashBallImage").style.display = "block";
                const streak = localStorage.getItem("randomStreak") || 0;
                document.getElementById("smashBallText").style.display = "inline";
                document.getElementById("displayStreak").textContent = streak;

                if (streakText) {
                    const streak = localStorage.getItem("randomStreak") || 0;
                    streakText.textContent = streak;
                }

                // Ensure the results container is displayed
                resultsContainer.style.display = "flex";
            }

            // function to apply flip animation
            function applyFlipAnimation(cell, color, callback) {
                cell.style.setProperty('--flip-color', color);
                cell.classList.add("flip");
                setTimeout(() => {
                    cell.classList.remove("flip");
                    if (callback) callback();
                }, 500);
            }

            // Initialize the streak count
            document.getElementById("streakCount").textContent = localStorage.getItem("randomStreak") || 0;
            document.getElementById("displayStreak").textContent = localStorage.getItem("randomStreak") || 0;
            
        })
        .catch(error => console.error("error loading csv:", error));
    });


//Success! Failure message in the todaysresultsbox
function successFailure(success) {
    const resultsMessageElement = document.getElementById("resultsMessage");
    resultsMessageElement.textContent = success ? "SUCCESS!" : "FAILURE";
    resultsMessageElement.setAttribute("resultsMessage", success ? "SUCCESS!" : "FAILURE");
                if (!success) {
                    resultsMessageElement.classList.add("failure");
                    console.log("successFailure-addfail: ", success);
                } else {
                    resultsMessageElement.classList.remove("failure");
                    resultsMessageElement.classList.add("success");
                    console.log("successFailure-removefail:", success);
                }
}

//How to play box popup
function toggleHowToPlay() {
    const howToPlayBox = document.getElementById("howToPlayBox");
    if (howToPlayBox.style.display === "none" || !howToPlayBox.style.display) {
        howToPlayBox.style.display = "block";
        howToPlayBox.classList.add("grow");   
    } else {
        howToPlayBox.style.display = "none";
        howToPlayBox.classList.remove("grow");
    }
}

//PR graphics popup
function toggleResultImagePopup() {
    const resultImagePopup = document.getElementById("resultImagePopup");
    if (resultImagePopup.style.display === "none" || !resultImagePopup.style.display) {
        resultImagePopup.style.display = "flex";
        resultImagePopup.classList.add("grow");
    } else {
        resultImagePopup.style.display = "none";
        resultImagePopup.classList.remove("grow");
    }
}

// Add a function to start a new random game when the "Continue?" button is clicked
function startNewGame(success) {
    window.randomGame();
    if (randomResultsBox.style.display !== "none" || !randomResultsBox.style.display) {
        randomResultsBox.style.display = "none";
        randomResultsBox.classList.remove("grow");
                        //if the last guess was wrong clear the correct answers from localstorage
        success = localStorage.getItem("success");
        console.log("startnewgamesuccess: ", success);
        if (success === false || success === "false") {
            localStorage.setItem("streakArrayTags", JSON.stringify([]));
            localStorage.setItem("streakArraySeasons", JSON.stringify([]));
        } 
    }
}

function updateStreak(success) {
    const streak = localStorage.getItem("randomStreak") || 0;
     
    if (success) {
        localStorage.setItem("randomStreak", parseInt(streak, 10) + 1);
        
    } else {
        localStorage.setItem("randomStreak", 0);
        
    }
}

function toggleTodaysResultsBox(success) {
    const todaysResultsBox = document.getElementById("todaysResultsBox");
    //const resultsFalcoImages = document.getElementById("resultsFalcoImages");
    //const ratingElement = document.getElementById("rating");

    if (todaysResultsBox.style.display === "none" || !todaysResultsBox.style.display) {
        // Move remaining Falco images to the results box
        //const remainingFalcoImages = document.querySelectorAll("#rating .falco-image");
        //console.log("toggleTodaysResultsBox-remainingFalcoImages: ", remainingFalcoImages);
        //remainingFalcoImages.forEach(img => {
        //resultsFalcoImages.appendChild(img);
        //});
        successFailure(success); // Success! Failure message in the todaysresults
        // Set the date in the results box
        const resultsDateElement = document.getElementById("resultsDate");
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString(undefined, options);
        resultsDateElement.textContent = today;

        todaysResultsBox.style.display = "block";
        todaysResultsBox.classList.add("grow");
    } else {
        todaysResultsBox.style.display = "none";
        todaysResultsBox.classList.remove("grow");
    }
}


function toggleRandomResultsBox(success) {
    const randomResultsBox = document.getElementById("randomResultsBox");
    const randomResultsTable = document.getElementById("randomResultsTable").querySelector("tbody");
    if (randomResultsBox.style.display === "none" || !randomResultsBox.style.display) {
        localStorage.setItem("success", success);
        console.log("toggleRandomResultsBox-success1: ", success);
        // Retrieve and parse the arrays properly
    let streakArrayTags = localStorage.getItem("streakArrayTags");
    console.log(localStorage.getItem("streakArrayTags"));
    if (!streakArrayTags) {
        streakArrayTags = []; // Default to an empty array if null
    } else {
    try {
        streakArrayTags = JSON.parse(streakArrayTags);
        if (!Array.isArray(streakArrayTags)) {
            streakArrayTags = []; // Ensure it's an array
        }
    } catch (error) {
        console.error("Error parsing streakArrayTags from localStorage:", error);
        streakArrayTags = []; // Handle corrupted data
        }
    }
    
    let streakArraySeasons = JSON.parse(localStorage.getItem("streakArraySeasons")) || [];

    console.log("streakArrayTags:", streakArrayTags);
    console.log("streakArraySeasons:", streakArraySeasons);
    
    // Clear previous table content
    randomResultsTable.innerHTML = "";

    // Populates the table with correct guesses and the first wrong guess
    streakArrayTags.forEach((tag, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${tag}</td><td>${streakArraySeasons[index]}</td>`;
        randomResultsTable.appendChild(row);
        randomResultsTable.rows[index].style.backgroundColor = "rgba(0, 255, 0, 0.7)";
    });

    //makes the last row row red if the last guess was wrong
    if (success === false || success === "false") {
        const lastRow = randomResultsTable.rows[randomResultsTable.rows.length - 1];
        lastRow.style.backgroundColor = "rgba(255, 0, 0, 0.7)"; 
    }

    console.log(streakArrayTags, Array.isArray(streakArrayTags)); 

     // Replace the random button with the Smash Ball image and show the streak text
     document.getElementById("smashBallImage2").style.display = "block";
     const streak = localStorage.getItem("randomStreak") || 0;
     document.getElementById("smashBallText2").style.display = "inline";

     //fake update the smashball streak just for the resultsbox
     if (success === true || success === "true") {
     var streak2 = Number(localStorage.getItem("randomStreak")) + 1;
     document.getElementById("displayStreak2").textContent = streak2;
     }
     else {
        var streak2 = Number(localStorage.getItem("randomStreak")) || 0;
        document.getElementById("displayStreak2").textContent = streak2;
     }
    // Show/hide the results box
        randomResultsBox.style.display = "block";
        randomResultsBox.classList.add("grow");
    } else {
        success = localStorage.getItem("success");
        console.log("randomresultsbox success: ", success);
        if (success === false || success === "false") {
            localStorage.setItem("streakArrayTags", JSON.stringify([]));
            localStorage.setItem("streakArraySeasons", JSON.stringify([]));
        }
        randomResultsBox.style.display = "none";
        randomResultsBox.classList.remove("grow");
       
    }
}