// Variabel permainan
let suits = [];
let values = [];
let calculusQuestions = [];

fetch('gameData.json')
    .then(response => response.json())
    .then(data => {
        suits = data.deck.suits;
        values = data.deck.values;
        calculusQuestions = data.calculusQuestions;
        init(); // panggil init setelah data JSON dimuat
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

// Elemen DOM
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

// Soal-soal turunan

// Inisialisasi permainan
function init() {
    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;
    calculusBtn.disabled = true;
    disablePowerups();
}

// Membuat deck kartu
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }

    // Mengacak deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Memulai permainan baru
function deal() {
    gameOver = false;
    playerHand = [];
    dealerHand = [];
    messageEl.textContent = "";
    calculusBtnUsed = false;
    calculusBtn.disabled = false;

    createDeck();

    // Membagikan kartu awal
    playerHand.push(dealCard());
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    dealerHand.push(dealCard());

    renderHands();

    // Memeriksa blackjack langsung
    if (calculateScore(playerHand) === 21) {
        endGame("Blackjack! Anda menang!", true);
    } else {
        hitBtn.disabled = false;
        standBtn.disabled = false;
        dealBtn.disabled = true;
    }

    disablePowerups();
}

// Mengambil kartu dari deck
function dealCard() {
    return deck.pop();
}

// Mengambil kartu tambahan
function hit() {
    if (gameOver) return;

    playerHand.push(dealCard());
    renderHands();

    const playerScore = calculateScore(playerHand);

    if (playerScore > 21) {
        endGame("Anda bust! Dealer menang.", false);
    } else if (playerScore === 21) {
        stand();
    }
}

// Berhenti mengambil kartu
function stand() {
    if (gameOver) return;

    gameOver = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    calculusBtn.disabled = true;

    // Dealer mengambil kartu sampai skor >= 17
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(dealCard());
    }

    renderHands(true);

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
}

// Menghitung skor tangan
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

    // Menyesuaikan skor jika ada ace dan skor melebihi 21
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

// Merender kartu ke layar
function renderHands(showDealerCard = false) {
    // Merender kartu dealer
    dealerCardsEl.innerHTML = '';
    dealerScoreEl.textContent = showDealerCard ? calculateScore(dealerHand) : '?';

    dealerHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');

        if (index === 0 && !showDealerCard && !powerups.peek) {
            cardEl.textContent = '?';
        } else {
            cardEl.textContent = card.value + card.suit;
        }

        dealerCardsEl.appendChild(cardEl);
    });

    // Merender kartu pemain
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

        playerCardsEl.appendChild(cardEl);
    });
}

// Mengakhiri permainan
function endGame(msg, playerWins) {
    gameOver = true;
    messageEl.textContent = msg;

    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;
    calculusBtn.disabled = true;
    disablePowerups();
}

// Fungsi untuk menampilkan soal kalkulus
function showCalculusQuestion() {
    if (calculusBtnUsed || gameOver) return;

    const randomQuestion = calculusQuestions[Math.floor(Math.random() * calculusQuestions.length)];
    calculusQuestionEl.textContent = randomQuestion.question;
    calculusAnswerEl.value = '';
    calculusModal.style.display = 'flex';
    calculusAnswerEl.focus();
}

// Fungsi untuk menutup modal
function closeModal() {
    calculusModal.style.display = 'none';
}

// Fungsi untuk memeriksa jawaban kalkulus
function checkCalculusAnswer() {
    const userAnswer = calculusAnswerEl.value.trim().toLowerCase();
    const correctAnswer = calculusQuestions.find(q => q.question === calculusQuestionEl.textContent).answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        messageEl.textContent = "Benar! Pilih salah satu powerup!";
        enablePowerups();
        calculusBtnUsed = true;
        calculusBtn.disabled = true;
    } else {
        messageEl.textContent = "Salah! Coba lagi lain kali.";
    }

    closeModal();
}

// Fungsi untuk mengaktifkan powerups
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

// Fungsi untuk menonaktifkan powerups
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

// Fungsi untuk menggunakan powerup
function usePowerup(type) {
    if (!powerups[type] || gameOver) return;

    switch (type) {
        case 'peek':
            // Lihat kartu lawan
            renderHands(true);
            setTimeout(() => {
                renderHands(false);
                powerups.peek = false;
                document.querySelector('.powerup-card:nth-child(1)').classList.add('disabled');
            }, 2000);
            break;

        case 'choose':
            // Pilih dari 2 kartu
            const card1 = dealCard();
            const card2 = dealCard();

            const choice = confirm(`Pilih salah satu kartu:\n1. ${card1.value + card1.suit}\n2. ${card2.value + card2.suit}\n\nKlik OK untuk kartu pertama, Cancel untuk kartu kedua`);

            playerHand.push(choice ? card1 : card2);
            renderHands();

            powerups.choose = false;
            document.querySelector('.powerup-card:nth-child(2)').classList.add('disabled');

            // Cek jika bust setelah menambah kartu
            if (calculateScore(playerHand) > 21) {
                endGame("Anda bust! Dealer menang.", false);
            }
            break;

        case 'remove':
            // Hapus kartu milik sendiri
            messageEl.textContent = "Klik kartu yang ingin dihapus";
            powerups.remove = true;
            renderHands();
            break;
    }
}

// Fungsi untuk menghapus kartu
function removeCard(index) {
    if (!powerups.remove) return;

    playerHand.splice(index, 1);
    powerups.remove = false;
    document.querySelector('.powerup-card:nth-child(3)').classList.add('disabled');
    renderHands();
    messageEl.textContent = "Kartu telah dihapus";
}

// Inisialisasi saat halaman dimuat
window.onload = init;