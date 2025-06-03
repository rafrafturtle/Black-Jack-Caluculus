let suits = [];
let values = [];
let calculusQuestions = [];
let powerupUsedThisTurn = false;

fetch('gameData.json')
    .then(response => response.json())
    .then(data => {
        suits = data.deck.suits;
        values = data.deck.values;
        calculusQuestions = data.calculusQuestions;
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

const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const messageEl = document.getElementById('message');
const hitBtn = document.getElementById('hit');
const standBtn = document.getElementById('stand');
const dealBtn = document.getElementById('deal');
const calculusBtn = document.getElementById('calculus-btn');
const powerupsEl = document.getElementById('powerups');
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
        dealBtn.disabled = true;
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
    renderHands(false, true, false); // player animasi saat hit


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
    powerupUsedThisTurn = false;
    if (gameOver) return;

    gameOver = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    calculusBtn.disabled = true;

    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(dealCard());
    }

    renderHands(true, false, true); // dealer animasi akhir


    const dealerScore = calculateScore(dealerHand);
    const playerScore = calculateScore(playerHand);

    if (dealerScore > 21) {
        endGame("Dealer bust! Anda menang.", true);
    } else if (dealerScore > playerScore) {
        endGame("Dealer menang!", false);
    } else if (playerScore > dealerScore) {
        endGame("Anda menang!", true);
    } else {
        endGame("Seri!", true);
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
    
    if (showDealerCard || powerups.peek) {
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

function endGame(msg) {
    gameOver = true;
    setTimeout(() => {
        messageEl.textContent = msg;
    }, 500);


    hitBtn.disabled = true;
    standBtn.disabled = true;
    calculusBtn.disabled = true;
    disablePowerups();

    // Tambahkan delay 1 detik sebelum membuka modal hasil game
    setTimeout(() => {
        openStartModal(false, msg);
    }, 1000); // 1000 ms = 1 detik
}



function showCalculusQuestion() {
    if (calculusBtnUsed || gameOver) return;

    const randomQuestion = calculusQuestions[Math.floor(Math.random() * calculusQuestions.length)];
    calculusQuestionEl.textContent = randomQuestion.question;
    calculusAnswerEl.value = '';
    calculusModal.style.display = 'flex';
    calculusAnswerEl.focus();
}

function closeModal() {
    calculusModal.style.display = 'none';
}

function checkCalculusAnswer() {
    const userAnswer = calculusAnswerEl.value.trim().toLowerCase();
    const currentQuestion = calculusQuestions.find(q => q.question === calculusQuestionEl.textContent);
    const correctAnswer = currentQuestion.answer.toLowerCase();

    calculusBtn.disabled = true;
    updateCalculusBtnState();

    if (userAnswer === correctAnswer) {
        messageEl.textContent = "Benar! Pilih salah satu powerup!";
        enablePowerups();
        closeModal();  // tutup modal soal
    } else {

        showExplanationPopup(
            `Jawaban kamu kurang tepat.<br><br>` +
            `<b>Soal:</b> ${currentQuestion.question}<br>` +
            `<b>Jawaban benar:</b> ${currentQuestion.answer}<br><br>` +
            `Penjelasan: ${currentQuestion.explanation || "Tidak ada penjelasan tambahan."}`
        );
    }
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

    // Disable semua powerup dan tampilannya
    powerups = { peek: false, choose: false, remove: false };
    document.querySelectorAll('.powerup-card').forEach(card => {
        card.classList.add('disabled');
    });

    switch (type) {
        case 'peek':
            renderHands(true);
            setTimeout(() => {
                renderHands(false);
            }, 2000);
            break;

        case 'choose':
            const card1 = dealCard();
            const card2 = dealCard();
            const choice = confirm(`Pilih salah satu kartu:\n1. ${card1.value + card1.suit}\n2. ${card2.value + card2.suit}\n\nKlik OK untuk kartu pertama, Cancel untuk kartu kedua`);
            playerHand.push(choice ? card1 : card2);
            renderHands();

            if (calculateScore(playerHand) > 21) {
                endGame("Anda bust! Dealer menang.", false);
            }
            break;

        case 'remove':
            messageEl.textContent = "Klik kartu yang ingin dihapus";
            powerups.remove = true; // izinkan pengguna klik kartu, tapi sudah tidak bisa pilih powerup lain
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

function openStartModal(isNewGame = true, resultMessage = "") {
    const modalBox = document.querySelector('.modal-box');

    if (isNewGame) {
        startModalTitle.textContent = "Selamat datang di Blackjack Kalkulus";
        startGameBtn.textContent = "Mulai Game";
        document.getElementById('start-modal-result').textContent = "";
        modalBox.style.backgroundColor = "#1E90FF"; // biru
    } else {
        startModalTitle.textContent = "Game selesai!";
        startGameBtn.textContent = "Main Lagi";
        document.getElementById('start-modal-result').textContent = resultMessage;

        const lowerMsg = resultMessage.toLowerCase();

        if (lowerMsg.includes("anda menang")) {
            modalBox.style.backgroundColor = "#28a745"; // hijau - menang
        } else if (lowerMsg.includes("dealer menang") || lowerMsg.includes("anda bust")) {
            modalBox.style.backgroundColor = "#dc3545"; // merah - kalah
        } else {
            modalBox.style.backgroundColor = "#1E90FF"; // biru - seri
        }
    }

    // Tampilkan modal dan nonaktifkan tombol
    startModal.style.display = 'flex';
    hitBtn.disabled = true;
    standBtn.disabled = true;
}



// Event listener tombol modal
startGameBtn.addEventListener('click', () => {
    startModal.style.display = 'none';
    deal();
    hitBtn.disabled = false;
    standBtn.disabled = false;
});

window.onload = function () {
    init();
    openStartModal(true);
}


