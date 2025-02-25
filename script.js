document.addEventListener("DOMContentLoaded", () => {
    fetch("data.csv")
        .then(response => response.text())
        .then(text => {
            const rows = text.split("\n").filter(row => row.trim() !== "").map(row => row.split(",").map(cell => (cell ? cell.trim() : "")));
            
            // extract header and data rows
            if (rows.length < 2) {
                console.error("csv does not contain enough data.");
                return;
            }
            
            const [header, ...data] = rows;
            const hintElement = document.getElementById("hint");
            const answerInput = document.getElementById("answerInput");
            const dataList = document.getElementById("answers");
            const rankTableBody = document.getElementById("rankTable").querySelector("tbody");
            const hintsTableBody = document.getElementById("hintsTable").querySelector("tbody");
            const feedbackElement = document.getElementById("feedback");
            const resultsContainer = document.getElementById("resultsContainer");
            const resultTitleElement = document.getElementById("resultTitle");
            const ratingElement = document.getElementById("rating");
            const resultImageElement = document.getElementById("resultImage");
            const resultImagePopup = document.getElementById("resultImagePopup");
            const resultImagePopupImg = resultImagePopup.querySelector("img");
            const dropdownMessage = document.getElementById("dropdownMessage");
            const newGameButton = document.getElementById("newGame");
            const currentDateElement = document.getElementById("currentDate");
            
            let previousDaysOffset = 1; // initialize the offset for previous days
            
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
            console.log(`today index: ${todayIndex}, data length: ${data.length}`); // log todayIndex and data.length
            const todayRow = data[todayIndex] || [];
            console.log(todayRow); // ensure this line is executed
            
            // ensure the row has enough columns before accessing
            if (todayRow.length < 7) {
                console.error("today's row is missing required columns.");
                return;
            }
            
            let currentRow = todayRow; // track the current row being used
            
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
                    return;
                }
                
                const correctAnswer = currentRow[3].toLowerCase();
                
                if (userGuess === correctAnswer) {
                    // localStorage.setItem("lastGuessDate", today);
                    // setCookie("lastGuessDate", today, 1);
                    showResults(true, guessCount, correctAnswer);
                    return;
                }
                
                // find the guessed row
                const guessedRow = data.find(row => row[3].toLowerCase() === userGuess && row[0] === currentRow[0]);
                console.log(guessedRow);
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
                    showResults(false, guessCount, correctAnswer);
                }
            };

            function showResults(success, guessCount, correctAnswer) {
                resultsContainer.style.display = "flex";
                resultTitleElement.textContent = success ? "SUCCESS!" : "FAILURE";
                resultTitleElement.setAttribute("data-text", success ? "SUCCESS!" : "FAILURE");
                if (!success) {
                    resultTitleElement.classList.add("FAILURE");
                } else {
                    resultTitleElement.classList.remove("FAILURE");
                }
                ratingElement.innerHTML = "";
                const rating = success ? maxGuesses - guessCount : 0;
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
            }

            window.startNewGame = function () {
                loadPreviousPuzzle();
            };

            function loadPreviousPuzzle() {
                const previousDate = new Date();
                previousDate.setDate(previousDate.getDate() - previousDaysOffset);
                const previousIndex = hashDate(previousDate);
                console.log(`previous index: ${previousIndex}, data length: ${data.length}`); // log previousIndex and data.length
                const previousRow = data[previousIndex] || [];
                console.log(previousRow); // ensure this line is executed
                
                // ensure the row has enough columns before accessing
                if (previousRow.length < 7) {
                    console.error("previous day's row is missing required columns.");
                    return;
                }

                // clear existing hints and rank table
                hintsTableBody.innerHTML = "";
                rankTableBody.innerHTML = "";

                // set initial hints for the previous day's puzzle
                const hintValues = [previousRow[1], "", "", ""];
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

                // populate rank table with ranks and blank tags for the previous day's puzzle
                populateRankTable(previousRow);

                // reset guess count and other elements
                guessCount = 0;
                feedbackElement.textContent = "";
                resultsContainer.style.display = "none";
                resultImageElement.style.display = "none";
                newGameButton.style.display = "none"; // hide the button until the puzzle is solved

                // update the date in the title
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                currentDateElement.textContent = previousDate.toLocaleDateString(undefined, options);

                // increment the offset for the next previous day
                previousDaysOffset++;
                currentRow = previousRow; // update the current row to the previous row

                // reset falco images
                ratingElement.innerHTML = "";
                for (let i = 0; i < maxGuesses; i++) {
                    const img = document.createElement("img");
                    img.src = "images/Falco_SSBM.png";
                    img.classList.add("falco-image");
                    ratingElement.appendChild(img);
                }

                // update hints for the previous day's puzzle
                hints.length = 0;
                hints.push(
                    { category: "Most Recent Appearance:", hint: previousRow[4] },
                    { category: "First Appearance:", hint: previousRow[5] },
                    { category: "Appearances:", hint: previousRow[6] }
                );
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
        })
        .catch(error => console.error("error loading csv:", error));
});

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

function startNewGame() {
    // placeholder function for new game functionality
    console.log("new game started");
}