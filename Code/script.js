import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, get , query, orderByChild, equalTo, ref, push, onValue, set, update } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
 

const firebaseConfig = {
    apiKey: "AIzaSyBG6YZQUUVoYAnqvItx4jXZM_O2XNBAG0Q",
    authDomain: "praktikum9-508a3.firebaseapp.com",
    databaseURL: "https://praktikum9-508a3-default-rtdb.firebaseio.com",
    projectId: "praktikum9-508a3",
    storageBucket: "praktikum9-508a3.appspot.com",
    messagingSenderId: "773024358158",
    appId: "1:773024358158:web:64d302b39c889bf2ab415f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const scoresRef = ref(database, 'scores');



let suits = [];
let values = [];
let powerupUsedThisTurn = false;
let playerScore = 0;

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        suits = data.deck.suits;
        values = data.deck.values;
        init();
    })
    .catch(error => {
        console.error("Gagal memuat data JSON:", error);
    });

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;
let calculusBtnUsed = false;
let powerups = {
    peek: false,
    choose: false,
    remove: false
};



let playerName = '';
const scoreDisplayEl = document.getElementById('score-display');
const nameModal = document.getElementById('name-modal');
const playerNameInput = document.getElementById('player-name');
const startWithNameBtn = document.getElementById('start-with-name');
const leaderboardContent = document.getElementById('leaderboard-content');

const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const messageEl = document.getElementById('gameMessage');
const hitBtn = document.getElementById('hit');
const standBtn = document.getElementById('stand');
const calculusBtn = document.getElementById('calculus-btn');
const calculusModal = document.getElementById('calculus-modal');
const calculusQuestionEl = document.getElementById('calculus-question');
const calculusAnswerEl = document.getElementById('calculus-answer');

function init() {
    hitBtn.disabled = true;
    standBtn.disabled = true;
    calculusBtn.disabled = true;
    disablePowerups();
}

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function deal() {
    gameOver = false;
    playerHand = [];
    dealerHand = [];
    messageEl.textContent = "";
    calculusBtnUsed = false;
    calculusBtn.disabled = false;
    calculusBtnUsed = false;
    calculusBtn.disabled = false;
    updateCalculusBtnState();



    createDeck();

    playerHand.push(dealCard());
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    dealerHand.push(dealCard());

    renderHands(false, true, true);

    if (calculateScore(playerHand) === 21) {
        endGame("Blackjack! Anda menang!", true);
    } else {
        hitBtn.disabled = false;
        standBtn.disabled = false;
    }
    disablePowerups();


}

function dealCard() {
    return deck.pop();
}

function hit() {
    powerupUsedThisTurn = false;
    if (gameOver) return;

    playerHand.push(dealCard());
    renderHands(false, true, false);


    const playerScore = calculateScore(playerHand);

    if (playerScore > 21) {
        endGame("Anda bust! Dealer menang.", false);
    } else if (playerScore === 21) {
        stand();
    }

    if (!calculusBtnUsed && !gameOver) {
        calculusBtn.disabled = false;
        updateCalculusBtnState();
    }
}

function stand() {
    window.scrollTo(0, 0);
    powerupUsedThisTurn = false;

    
    powerups.remove = false;

    if (gameOver) return;

    hitBtn.disabled = true;
    standBtn.disabled = true;
    calculusBtn.disabled = true;

    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(dealCard());
    }

    renderHands(true, false, true);

    const dealerScore = calculateScore(dealerHand);
    const playerScore = calculateScore(playerHand);

    if (dealerScore > 21) {
        endGame("Dealer bust! Anda menang.", true);
    } else if (dealerScore > playerScore) {
        endGame("Dealer menang!", false);
    } else if (playerScore > dealerScore) {
        endGame("Anda menang!", true);
    } else {
        endGame("Seri!", true, true);
    }

    if (!calculusBtnUsed && !gameOver) {
        calculusBtn.disabled = false;
        updateCalculusBtnState();
    }
}


function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function renderHands(showDealerCard = false, animatePlayer = false, animateDealer = false) {
    dealerCardsEl.innerHTML = '';

    if (showDealerCard || powerups.peek || calculateScore(dealerHand) > 21) {
        dealerScoreEl.textContent = calculateScore(dealerHand);
    } else {
        const visibleCard = dealerHand[1];
        let visibleScore = 0;

        if (visibleCard.value === 'A') {
            visibleScore = 11;
        } else if (['K', 'Q', 'J'].includes(visibleCard.value)) {
            visibleScore = 10;
        } else {
            visibleScore = parseInt(visibleCard.value);
        }

        dealerScoreEl.textContent = `? + ${visibleScore}`;
    }


    dealerHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');

        if (index === 0 && !showDealerCard && !powerups.peek) {
            cardEl.textContent = '?';
        } else {
            cardEl.textContent = card.value + card.suit;
        }

        if (animateDealer && (index === dealerHand.length - 1)) {
            cardEl.style.transition = 'transform 0.6s ease';
            setTimeout(() => {
                cardEl.style.transform = 'rotateY(360deg)';
            }, 200);
        }

        dealerCardsEl.appendChild(cardEl);
    });

    playerCardsEl.innerHTML = '';
    playerScoreEl.textContent = calculateScore(playerHand);

    playerHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');
        cardEl.textContent = card.value + card.suit;

        if (powerups.remove) {
            cardEl.onclick = function () { removeCard(index); };
            cardEl.style.cursor = 'pointer';
        }

        if (animatePlayer && index === playerHand.length - 1) {
            cardEl.style.transition = 'transform 0.6s ease';
            setTimeout(() => {
                cardEl.style.transform = 'rotateY(360deg)';
            }, 50);
        }

        playerCardsEl.appendChild(cardEl);
    });
}


function handleNameInput() {
    startWithNameBtn.addEventListener('click', () => {
        playerName = playerNameInput.value.trim();
        if (playerName === '') {
            alert('Silakan masukkan nama Anda!');
            return;
        }
        nameModal.style.display = 'none';
        openStartModal(true);
    });
}


function loadLeaderboard() {
    onValue(scoresRef, (snapshot) => {
        const scores = snapshot.val();
        leaderboardContent.innerHTML = '';

        if (!scores) {
            leaderboardContent.innerHTML = '<p>Belum ada skor tersimpan</p>';
            return;
        }

        
        const scoresArray = Object.entries(scores).map(([id, score]) => ({
            id,
            ...score
        })).sort((a, b) => b.score - a.score);

        
        scoresArray.slice(0, 10).forEach((item, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'leaderboard-item';
            scoreItem.innerHTML = `
                <span>${index + 1}. ${item.name}</span>
                <span>${item.score}</span>
            `;
            leaderboardContent.appendChild(scoreItem);
        });
    });
}

function saveScore(name, score) {
    if (!name || score <= 0) return;

    const scoresRef = ref(database, 'scores');

    get(scoresRef).then(snapshot => {
        let found = false;

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            const key = childSnapshot.key;

            if (data.name === name) {
                found = true;

                if (score > data.score) {
                    const updatedEntry = {
                        name: name,
                        score: score,
                        timestamp: new Date().toISOString()
                    };

                    set(ref(database, 'scores/' + key), updatedEntry)
                        .then(() => {
                            console.log("Skor diperbarui di leaderboard.");
                        })
                        .catch(error => {
                            console.error("Gagal memperbarui skor:", error);
                        });
                } else {
                    console.log("Skor tidak diperbarui karena tidak lebih tinggi.");
                }
            }
        });

        if (!found) {
            const newScoreRef = push(scoresRef);
            const newEntry = {
                name: name,
                score: score,
                timestamp: new Date().toISOString()
            };

            set(newScoreRef, newEntry)
                .then(() => {
                    console.log("Skor baru disimpan ke leaderboard.");
                })
                .catch(error => {
                    console.error("Gagal menyimpan skor baru:", error);
                });
        }
    }).catch(error => {
        console.error("Gagal mengakses skor:", error);
    });
}




function endGame(msg, isWin, isDraw = false) {
    window.scrollTo(0, 0);
    gameOver = true;

    if (isDraw) {
        playerScore = Math.floor(playerScore / 2);
    }

    if (!isWin) {
        saveScore(playerName, playerScore);
    }

    updateScoreDisplay();
    messageEl.textContent = msg;

    setTimeout(() => {
        openStartModal(false, msg, isWin); // kirim isWin ke modal
    }, 1500);
}



const calculusQuestions = [];
let currentCalculusQuestion = null;

function showCalculusQuestion() {
    generateCalculusQuestions();
    if (calculusBtnUsed || gameOver) return;

    const randomQuestion = calculusQuestions[Math.floor(Math.random() * calculusQuestions.length)];
    currentCalculusQuestion = randomQuestion;
    calculusQuestionEl.innerHTML = randomQuestion.question;

    const correct = randomQuestion.answer;
    const fakeAnswers = new Set();
    while (fakeAnswers.size < 3) {
        let variation = correct.replace(/\d+/g, num => {
            const n = parseInt(num);
            const rand = n + Math.floor(Math.random() * 3) - 1;
            return rand < 0 ? 0 : rand;
        });
        if (variation !== correct) fakeAnswers.add(variation);
    }

    const allAnswers = [...fakeAnswers, correct];
    shuffleArray(allAnswers);

    const choicesContainer = document.getElementById('calculus-choices');
    choicesContainer.innerHTML = '';
    allAnswers.forEach(answer => {
        const btn = document.createElement('button');
        btn.innerHTML = answer;
        btn.onclick = () => checkChoiceAnswer(answer, correct);
        choicesContainer.appendChild(btn);
    });

    calculusModal.style.display = 'flex';
}

function checkChoiceAnswer(selected, correct) {
    calculusBtn.disabled = true;
    updateCalculusBtnState();

    if (selected === correct) {
        playerScore += 100;
        updateScoreDisplay();
        messageEl.textContent = "Benar! +100 poin! Pilih salah satu powerup!";
        enablePowerups();
        closeModal();
    } else {
        showExplanationPopup(
            `Jawaban kamu kurang tepat.<br><br>` +
            `<b>Soal:</b> ${currentCalculusQuestion.question}<br>` +
            `<b>Jawaban benar:</b> ${correct}<br><br>` +
            `Penjelasan: ${currentCalculusQuestion.explanation || "Tidak ada penjelasan tambahan."}`
        );
    }
}

function closeModal() {
    calculusModal.style.display = 'none';
}

function formatTerm(coef, exp) {
    if (exp === 0) return `${coef}`;
    if (exp === 1) return `${coef === 1 ? '' : coef}x`;
    return `${coef === 1 ? '' : coef}x<sup>${exp}</sup>`;
}

function formatDerivative(coef, exp) {
    if (exp === 1) return `${coef}`;
    if (exp === 2) return `${coef}x`;
    return `${coef}x<sup>${exp - 1}</sup>`;
}

function generateUniqueExponents(count, max = 6) {
    const set = new Set();
    while (set.size < count) {
        set.add(Math.floor(Math.random() * max) + 1);
    }
    return Array.from(set);
}

function generateUniqueCoefs(count, max = 20) {
    const set = new Set();
    while (set.size < count) {
        set.add(Math.floor(Math.random() * max) + 1);
    }
    return Array.from(set);
}

function generateCalculusQuestions(count = 20) {
    const formats = [
        (a1, n1, a2, n2) => ({
            question: `Turunan dari f(x) = ${formatTerm(1, n1)} + ${formatTerm(a1, n2)}`,
            answer: `f'(x) = ${formatDerivative(1 * n1, n1)} + ${formatDerivative(a1 * n2, n2)}`,
            explanation: `Turunan dari x<sup>${n1}</sup> adalah ${n1}x<sup>${n1 - 1}</sup>, dan turunan dari ${a1}x<sup>${n2}</sup> adalah ${a1 * n2}x<sup>${n2 - 1}</sup>.`
        }),
        (a1, n1, a2) => ({
            question: `Turunan dari f(x) = ${formatTerm(a1, n1)} + ${formatTerm(1, n1)} + ${formatTerm(a2, 1)}`,
            answer: `f'(x) = ${formatDerivative((a1 + 1) * n1, n1)} + ${a2}`,
            explanation: `Gabungan dari dua suku berpangkat ${n1} menjadi ${(a1 + 1) * n1}x<sup>${n1 - 1}</sup>, dan turunan dari ${a2}x adalah ${a2}.`
        }),
        (a1, n1, a2, n2, a3, n3) => ({
            question: `Turunan dari f(x) = ${formatTerm(1, n1)} + ${formatTerm(a1, n2)} + ${formatTerm(a2, n3)}`,
            answer: `f'(x) = ${formatDerivative(1 * n1, n1)} + ${formatDerivative(a1 * n2, n2)} + ${formatDerivative(a2 * n3, n3)}`,
            explanation: `Turunan dilakukan pada tiap suku.`
        }),
    ];

    calculusQuestions.length = 0;

    for (let i = 0; i < count; i++) {
        const formatIndex = Math.floor(Math.random() * formats.length);
        const f = formats[formatIndex];

        const [a1, a2, a3] = generateUniqueCoefs(3);
        const [n1, n2, n3] = generateUniqueExponents(3);

        let q;
        if (formatIndex === 0) q = f(a1, n1, a2, n2);
        else if (formatIndex === 1) q = f(a1, n1, a2);
        else q = f(a1, n1, a2, n2, a3, n3);

        calculusQuestions.push(q);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}



function updateScoreDisplay() {
    scoreDisplayEl.textContent = `Skor: ${playerScore}`;
}

function closeExplanationPopup() {
    document.getElementById('explanation-popup').style.display = 'none';
    closeModal();
}


function enablePowerups() {
    const powerupCards = document.querySelectorAll('.powerup-card');
    powerupCards.forEach(card => {
        card.classList.remove('disabled');
    });

    powerups = {
        peek: true,
        choose: true,
        remove: true
    };
}

function disablePowerups() {
    const powerupCards = document.querySelectorAll('.powerup-card');
    powerupCards.forEach(card => {
        card.classList.add('disabled');
    });

    powerups = {
        peek: false,
        choose: false,
        remove: false
    };
}
function showExplanationPopup(message) {
    document.getElementById('explanation-message').innerHTML = message;
    document.getElementById('explanation-popup').style.display = 'flex';
}


function usePowerup(type) {
    if (powerupUsedThisTurn) return;

    powerupUsedThisTurn = true;

    powerups = { peek: false, choose: false, remove: false };
    document.querySelectorAll('.powerup-card').forEach(card => {
        card.classList.add('disabled');
    });

    switch (type) {
        case 'peek':
            window.scrollTo(0, 0);
            renderHands(true);
            setTimeout(() => {
                renderHands(false);
            }, 2000);
            break;

        case 'choose':
            const cards = [dealCard(), dealCard(), dealCard(), dealCard(), dealCard()];
            let message = "Pilih salah satu kartu:\n";
            cards.forEach((card, i) => {
                message += `${i + 1}. ${card.value + card.suit}\n`;
            });

            let choiceIndex = prompt(message + "\nKetik angka 1-5 untuk memilih:");
            choiceIndex = parseInt(choiceIndex) - 1;

            if (choiceIndex >= 0 && choiceIndex < 5) {
                playerHand.push(cards[choiceIndex]);
                renderHands();

                if (calculateScore(playerHand) > 21) {
                    endGame("Anda bust! Dealer menang.", false);
                }else if (calculateScore(playerHand)===21){
                    endGame('',false)
                }
            } else {
                alert("Pilihan tidak valid. Tidak ada kartu yang ditambahkan.");
            }
            break;

        case 'remove':
            messageEl.textContent = "Klik kartu yang ingin dihapus";
            powerups.remove = true;
            renderHands();
            break;
    }
}


function updateCalculusBtnState() {
    if (!calculusBtn.disabled) {
        calculusBtn.classList.add('active');
    } else {
        calculusBtn.classList.remove('active');
    }
}


function removeCard(index) {
    if (!powerups.remove) return;

    playerHand.splice(index, 1);
    powerups.remove = false;
    document.querySelector('.powerup-card:nth-child(3)').classList.add('disabled');
    renderHands();
    messageEl.textContent = "Kartu telah dihapus";
}

const startModal = document.getElementById('start-modal');
const startModalTitle = document.getElementById('start-modal-title');
const startGameBtn = document.getElementById('start-game-btn');

function openStartModal(isNewGame = true, resultMessage = "", wasWin = true) {
    const modalBox = document.querySelector('#start-modal .modal-box');

    modalBox.classList.remove('default-state', 'win-state', 'lose-state', 'draw-state');

    if (isNewGame) {
        startModalTitle.textContent = "Selamat datang di Blackjack Kalkulus";
        startGameBtn.textContent = "Mulai Game";
        document.getElementById('start-modal-result').textContent = "";
        modalBox.classList.add('default-state');
    } else {
        startGameBtn.textContent = "Main Lagi";
        document.getElementById('start-modal-result').textContent = resultMessage;
        document.getElementById('game-explanation').style.display = 'none';

        const lowerMsg = resultMessage.toLowerCase();

        if ((lowerMsg.includes("dealer menang") || lowerMsg.includes("anda bust")) && playerScore === 0) {
            startModalTitle.innerHTML = "Game berakhir!<br>Tingkatkan skor agar masuk leaderboard";
            modalBox.classList.add('lose-state');
        } else if (lowerMsg.includes("dealer menang") || lowerMsg.includes("anda bust")) {
            startModalTitle.innerHTML = "Game berakhir!<br>Skor disimpan ke leaderboard";
            modalBox.classList.add('lose-state');
        } else if (lowerMsg.includes("seri")) {
            startModalTitle.innerHTML = "Game berlanjut!<br>Tapi Skor berkurang setengah";
            modalBox.classList.add('draw-state');
        } else {
            startModalTitle.innerHTML = "Game berlanjut!<br>dapatkan skor setinggi mungkin!";
            startGameBtn.textContent = "Lanjut";
            modalBox.classList.add('win-state');
        }

        // Reset skor ke 0 jika barusan kalah
        if (!wasWin) {
            startGameBtn.onclick = () => {
                playerScore = 0;
                updateScoreDisplay();
                startModal.style.display = 'none';
                deal();
            };
        } else {
            startGameBtn.onclick = () => {
                startModal.style.display = 'none';
                deal();
            };
        }
    }

    document.getElementById('start-modal').style.display = "flex";
    document.getElementById('hit').disabled = true;
    document.getElementById('stand').disabled = true;
}


window.onload = function () {
    init();
    handleNameInput();
    loadLeaderboard();
    
    nameModal.style.display = 'flex';
    startModal.style.display = 'none';
}


window.showCalculusQuestion = showCalculusQuestion;
window.usePowerup = usePowerup;
window.closeExplanationPopup = closeExplanationPopup;
window.deal = deal;
window.hit = hit;
window.stand = stand;

startGameBtn.addEventListener('click', () => {
    startModal.style.display = 'none';
    deal();
});

document.querySelectorAll('.powerup-card').forEach(card => {
    card.addEventListener('click', function () {
        const type = this.textContent.includes('Lihat') ? 'peek' :
            this.textContent.includes('Pilih') ? 'choose' : 'remove';
        usePowerup(type);
    });
});

        const db = getDatabase(app);

        // Control variables
        let canComment = true;
        const delayTime = 15 * 1000; // 15 seconds cooldown

        // Load only verified comments (status: true)
        function loadVerifiedComments() {
          const commentsRef = ref(db, 'comments');
          const verifiedQuery = query(commentsRef, orderByChild('verified'), equalTo(true));

          onValue(verifiedQuery, (snapshot) => {
            const commentsData = snapshot.val();
            const container = document.getElementById('comments-container');
            container.innerHTML = '';

            if (commentsData) {
              // Convert to array and sort by timestamp (newest first)
              const commentsArray = Object.values(commentsData)
                .sort((a, b) => b.timestamp - a.timestamp);

              commentsArray.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';

                // Format timestamp
                const commentDate = new Date(comment.timestamp);
                const timeString = commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = commentDate.toLocaleDateString();

                commentElement.innerHTML = `
          <div class="comment-name">${comment.name}</div>
          <div class="comment-text">${comment.message}</div>
          <div class="comment-time">${dateString} ${timeString}</div>
        `;

                container.prepend(commentElement); // Add to top
              });
            } else {
              container.innerHTML = '<p style="color: #9ca3af; text-align: center;">Belum ada komentar</p>';
            }
          });
        }

        // Submit comment form
        document.getElementById('comment-form').addEventListener('submit', (e) => {
          e.preventDefault();

          const name = document.getElementById('name').value.trim();
          const message = document.getElementById('message').value.trim();
          const sendButton = document.querySelector('#comment-form button');

          if (!canComment) {
            return;
          }

          if (name && message) {
            sendButton.disabled = true;
            sendButton.textContent = "Mengirim...";

            // Submit comment with verified: false by default
            const commentRef = ref(db, 'comments');
            push(commentRef, {
              name,
              message,
              timestamp: Date.now(),
              verified: false // Default to unverified
            })
              .then(() => {

                document.getElementById('comment-form').reset();

                // Cooldown timer
                canComment = false;
                setTimeout(() => {
                  canComment = true;
                }, delayTime);
              })
              .catch((err) => {
                console.error(err);
              })
              .finally(() => {
                sendButton.disabled = false;
                sendButton.textContent = "Kirim Komentar";
              });
          }
        });

        // Load verified comments when page loads
        document.addEventListener('DOMContentLoaded', loadVerifiedComments);

    window.checkPlayerName = checkPlayerName
    function checkPlayerName() {
    const nameInput = document.getElementById('player-name').value.trim();
    
    if (nameInput.toLowerCase() === 'admin123') {
      window.location.href = 'admin.html';
    }
  }
