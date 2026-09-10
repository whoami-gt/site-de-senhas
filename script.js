// Elementos do DOM
const passwordInput = document.getElementById("password");
const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");
const wordsCountInput = document.getElementById("wordsCount");
const wordsCountValue = document.getElementById("wordsCountValue");
const separatorSelect = document.getElementById("separatorSelect");

// Checkboxes de opções de caracteres
const uppercaseCheck = document.getElementById("uppercase");
const lowercaseCheck = document.getElementById("lowercase");
const numbersCheck = document.getElementById("numbers");
const symbolsCheck = document.getElementById("symbols");
const excludeAmbiguousCheck = document.getElementById("excludeAmbiguous");

// Opções de frase memorável
const capitalizeWordsCheck = document.getElementById("capitalizeWords");
const includeNumberPassphraseCheck = document.getElementById("includeNumberPassphrase");

// Botões principais
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const copyBtnText = document.getElementById("copyBtnText");
const visibilityBtn = document.getElementById("visibilityBtn");
const eyeIcon = document.getElementById("eyeIcon");
const eyeOffIcon = document.getElementById("eyeOffIcon");
const regenerateBtn = document.getElementById("regenerateBtn");

// Abas de Modo
const tabCharMode = document.getElementById("tabCharMode");
const tabPassphraseMode = document.getElementById("tabPassphraseMode");
const charModeSection = document.getElementById("charModeSection");
const passphraseModeSection = document.getElementById("passphraseModeSection");

// Indicadores de Força e Tempo de Quebra
const strengthText = document.getElementById("strengthText");
const strengthProgress = document.getElementById("strengthProgress");
const crackTimeText = document.getElementById("crackTimeText");
const message = document.getElementById("message");

// Histórico
const historyToggleBtn = document.getElementById("historyToggleBtn");
const historyList = document.getElementById("historyList");
const historyItems = document.getElementById("historyItems");
const historyCount = document.getElementById("historyCount");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Tema Escuro/Claro
const themeToggle = document.getElementById("themeToggle");
const themeIconSun = document.getElementById("themeIconSun");
const themeIconMoon = document.getElementById("themeIconMoon");

// Estado da aplicação
let currentMode = "characters"; // "characters" | "passphrase"
let isPasswordMasked = false;
let messageTimeout = null;
let recentPasswords = [];

// Conjuntos de caracteres
const characterSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%&*+-_=<>?"
};

const ambiguousChars = /[0Oo1lI|]/g;

// Banco de palavras em português selecionadas para Frases Memoráveis
const wordDictionary = [
    "sol", "lua", "mar", "rio", "vento", "fogo", "terra", "nuvem", "estrela", "floresta",
    "tigre", "aguia", "lobo", "falcao", "urso", "pantera", "leao", "tubarao", "golfinho", "coruja",
    "azul", "verde", "dourado", "prata", "rubi", "ambar", "cristal", "safira", "coral", "perola",
    "forte", "veloz", "sabio", "nobre", "valente", "livre", "brilhante", "sereno", "audaz", "radiante",
    "ponte", "castelo", "farol", "navio", "espada", "escudo", "foguete", "portal", "torre", "bussola",
    "viagem", "sonho", "aurora", "horizonte", "eco", "chama", "prisma", "trovao", "oasis", "galaxia",
    "cafe", "tempo", "ritmo", "codigo", "musica", "livro", "raiz", "alvo", "farol", "piano"
];

// ==========================================
// Funções Criptográficas e Utilitários
// ==========================================

// Retorna número inteiro criptograficamente seguro no intervalo [0, max - 1]
function getSecureRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

// Embaralhamento seguro com Fisher-Yates
function secureShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ==========================================
// Geração de Senhas
// ==========================================

function generateCharacterPassword() {
    const length = Number(lengthInput.value);
    const excludeAmbiguous = excludeAmbiguousCheck.checked;

    let activeSets = [];
    if (uppercaseCheck.checked) activeSets.push(characterSets.uppercase);
    if (lowercaseCheck.checked) activeSets.push(characterSets.lowercase);
    if (numbersCheck.checked) activeSets.push(characterSets.numbers);
    if (symbolsCheck.checked) activeSets.push(characterSets.symbols);

    // Se o usuário desmarcou tudo, força ao menos minúsculas
    if (activeSets.length === 0) {
        lowercaseCheck.checked = true;
        activeSets.push(characterSets.lowercase);
        showMessage("Ao menos um conjunto foi reativado!", true);
    }

    // Filtrar caracteres ambíguos se solicitado
    if (excludeAmbiguous) {
        activeSets = activeSets.map(set => set.replace(ambiguousChars, "")).filter(set => set.length > 0);
    }

    const availableCharacters = activeSets.join("");
    const passwordChars = [];

    // Garante pelo menos um caractere de cada categoria
    for (const charSet of activeSets) {
        if (passwordChars.length < length) {
            const randIdx = getSecureRandomInt(charSet.length);
            passwordChars.push(charSet[randIdx]);
        }
    }

    // Preenche o restante do comprimento
    while (passwordChars.length < length) {
        const randIdx = getSecureRandomInt(availableCharacters.length);
        passwordChars.push(availableCharacters[randIdx]);
    }

    return secureShuffle(passwordChars).join("");
}

function generatePassphrase() {
    const wordCount = Number(wordsCountInput.value);
    const separator = separatorSelect.value;
    const capitalize = capitalizeWordsCheck.checked;
    const includeNumber = includeNumberPassphraseCheck.checked;

    const chosenWords = [];
    for (let i = 0; i < wordCount; i++) {
        let word = wordDictionary[getSecureRandomInt(wordDictionary.length)];
        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        chosenWords.push(word);
    }

    let result = chosenWords.join(separator);

    if (includeNumber) {
        const num = getSecureRandomInt(90) + 10; // Número entre 10 e 99
        result += separator + num;
    }

    return result;
}

// Animação de Scramble (Efeito Matrix) ao gerar senha
function animatePasswordDisplay(finalPassword) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let iteration = 0;
    const maxIterations = 6;
    
    regenerateBtn.classList.add("spinning");
    setTimeout(() => regenerateBtn.classList.remove("spinning"), 400);

    const interval = setInterval(() => {
        if (iteration >= maxIterations) {
            clearInterval(interval);
            passwordInput.value = finalPassword;
            calculateStrengthAndEntropy(finalPassword);
            addToHistory(finalPassword);
        } else {
            passwordInput.value = finalPassword
                .split("")
                .map((char, index) => {
                    if (index < (iteration / maxIterations) * finalPassword.length) {
                        return finalPassword[index];
                    }
                    return chars[getSecureRandomInt(chars.length)];
                })
                .join("");
            iteration++;
        }
    }, 25);
}

function generateNewPassword(animate = true) {
    let password = "";
    if (currentMode === "characters") {
        password = generateCharacterPassword();
    } else {
        password = generatePassphrase();
    }

    if (animate) {
        animatePasswordDisplay(password);
    } else {
        passwordInput.value = password;
        calculateStrengthAndEntropy(password);
        addToHistory(password);
    }
}

// ==========================================
// Cálculo de Entropia e Tempo de Quebra
// ==========================================

function calculateStrengthAndEntropy(password) {
    if (!password) {
        strengthText.textContent = "—";
        strengthProgress.style.width = "0%";
        crackTimeText.textContent = "—";
        return;
    }

    // Calcula o tamanho do conjunto de caracteres utilizado (Pool Size)
    let poolSize = 0;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) poolSize += 20;

    // Se for modo frase com palavras do dicionário
    if (currentMode === "passphrase") {
        poolSize = Math.max(poolSize, wordDictionary.length);
    }

    // Entropia em bits: E = L * log2(Pool)
    const entropy = password.length * Math.log2(Math.max(poolSize, 2));

    // Estimativa de tempo para quebrar assumindo 10 bilhões de tentativas/segundo (cluster GPU moderno)
    const guessesPerSecond = 1e10;
    const combinations = Math.pow(2, entropy);
    const secondsToCrack = combinations / (2 * guessesPerSecond);

    const formattedCrackTime = formatCrackTime(secondsToCrack);
    crackTimeText.textContent = formattedCrackTime;

    // Classificação da Força
    if (entropy < 36 || password.length < 8) {
        strengthText.textContent = "Muito Fraca";
        strengthText.style.color = "#ef4444";
        strengthText.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
        strengthProgress.style.width = "20%";
        strengthProgress.style.backgroundColor = "#ef4444";
    } else if (entropy < 55 || password.length < 11) {
        strengthText.textContent = "Fraca";
        strengthText.style.color = "#f97316";
        strengthText.style.backgroundColor = "rgba(249, 115, 22, 0.12)";
        strengthProgress.style.width = "45%";
        strengthProgress.style.backgroundColor = "#f97316";
    } else if (entropy < 75) {
        strengthText.textContent = "Boa / Segura";
        strengthText.style.color = "#10b981";
        strengthText.style.backgroundColor = "rgba(16, 185, 129, 0.12)";
        strengthProgress.style.width = "75%";
        strengthProgress.style.backgroundColor = "#10b981";
    } else {
        strengthText.textContent = "Excelente";
        strengthText.style.color = "#06b6d4";
        strengthText.style.backgroundColor = "rgba(6, 182, 212, 0.12)";
        strengthProgress.style.width = "100%";
        strengthProgress.style.backgroundColor = "#06b6d4";
    }
}

function formatCrackTime(seconds) {
    if (seconds < 1) return "Instantâneo";
    if (seconds < 60) return `~${Math.round(seconds)} segundos`;
    
    const minutes = seconds / 60;
    if (minutes < 60) return `~${Math.round(minutes)} minutos`;
    
    const hours = minutes / 60;
    if (hours < 24) return `~${Math.round(hours)} horas`;
    
    const days = hours / 24;
    if (days < 30) return `~${Math.round(days)} dias`;
    
    const months = days / 30;
    if (months < 12) return `~${Math.round(months)} meses`;
    
    const years = days / 365.25;
    if (years < 1000) return `~${Math.round(years)} anos`;
    if (years < 1e6) return `~${(years / 1000).toFixed(1)} mil anos`;
    if (years < 1e9) return `~${(years / 1e6).toFixed(1)} milhões de anos`;
    return `+1 bilhão de anos`;
}

// ==========================================
// Histórico de Senhas
// ==========================================

function addToHistory(password) {
    if (!password || recentPasswords.includes(password)) return;
    
    recentPasswords.unshift(password);
    if (recentPasswords.length > 5) {
        recentPasswords.pop();
    }
    
    updateHistoryUI();
}

function updateHistoryUI() {
    historyCount.textContent = recentPasswords.length;
    historyItems.innerHTML = "";

    if (recentPasswords.length === 0) {
        historyItems.innerHTML = `<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:12px;">Nenhuma senha recente</div>`;
        return;
    }

    recentPasswords.forEach(pwd => {
        const item = document.createElement("div");
        item.className = "history-item";
        
        const pwdSpan = document.createElement("span");
        pwdSpan.className = "history-item-pwd";
        pwdSpan.textContent = pwd;
        
        const copyBtnItem = document.createElement("button");
        copyBtnItem.className = "history-copy-btn";
        copyBtnItem.title = "Copiar esta senha";
        copyBtnItem.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        
        copyBtnItem.addEventListener("click", () => {
            copyToClipboard(pwd, copyBtnItem);
        });

        item.appendChild(pwdSpan);
        item.appendChild(copyBtnItem);
        historyItems.appendChild(item);
    });
}

// ==========================================
// Área de Transferência (Clipboard)
// ==========================================

async function copyToClipboard(text, customBtn = null) {
    if (!text) {
        showMessage("Nenhuma senha para copiar!", true);
        return;
    }

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            passwordInput.select();
            document.execCommand("copy");
        }

        // Feedback no botão principal se aplicável
        if (!customBtn || customBtn === copyBtn) {
            copyBtn.classList.add("copied");
            copyBtnText.textContent = "Copiado! ✓";
            setTimeout(() => {
                copyBtn.classList.remove("copied");
                copyBtnText.textContent = "Copiar";
            }, 1600);
        }

        showMessage("Senha copiada com sucesso!");
    } catch (err) {
        showMessage("Erro ao copiar para a área de transferência!", true);
    }
}

function showMessage(text, isError = false) {
    if (messageTimeout) clearTimeout(messageTimeout);
    
    message.textContent = text;
    if (isError) {
        message.classList.add("error");
    } else {
        message.classList.remove("error");
    }

    messageTimeout = setTimeout(() => {
        message.textContent = "";
        message.classList.remove("error");
    }, 2200);
}

// ==========================================
// Tema Claro / Escuro
// ==========================================

function initTheme() {
    const savedTheme = localStorage.getItem("password_gen_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.body.classList.add("dark-theme");
        themeIconSun.classList.add("hidden");
        themeIconMoon.classList.remove("hidden");
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    
    if (isDark) {
        themeIconSun.classList.add("hidden");
        themeIconMoon.classList.remove("hidden");
        localStorage.setItem("password_gen_theme", "dark");
    } else {
        themeIconSun.classList.remove("hidden");
        themeIconMoon.classList.add("hidden");
        localStorage.setItem("password_gen_theme", "light");
    }
});

// ==========================================
// Event Listeners
// ==========================================

// Alternar visibilidade da senha (mostrar/ocultar)
visibilityBtn.addEventListener("click", () => {
    isPasswordMasked = !isPasswordMasked;
    passwordInput.type = isPasswordMasked ? "password" : "text";
    eyeIcon.classList.toggle("hidden", isPasswordMasked);
    eyeOffIcon.classList.toggle("hidden", !isPasswordMasked);
});

// Slider de comprimento (modo caracteres)
lengthInput.addEventListener("input", () => {
    lengthValue.textContent = lengthInput.value;
    generateNewPassword(false);
});

// Slider de palavras (modo frase)
wordsCountInput.addEventListener("input", () => {
    wordsCountValue.textContent = `${wordsCountInput.value} palavras`;
    generateNewPassword(false);
});

// Mudança no separador ou opções
separatorSelect.addEventListener("change", () => generateNewPassword(false));
capitalizeWordsCheck.addEventListener("change", () => generateNewPassword(false));
includeNumberPassphraseCheck.addEventListener("change", () => generateNewPassword(false));

// Checkboxes do modo caractere
[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck, excludeAmbiguousCheck].forEach(chk => {
    chk.addEventListener("change", () => generateNewPassword(false));
});

// Botão Regenerar e Gerar
regenerateBtn.addEventListener("click", () => generateNewPassword(true));
generateBtn.addEventListener("click", () => generateNewPassword(true));

// Botão Copiar
copyBtn.addEventListener("click", () => copyToClipboard(passwordInput.value));

// Alternar abas de modo
tabCharMode.addEventListener("click", () => {
    if (currentMode === "characters") return;
    currentMode = "characters";
    tabCharMode.classList.add("active");
    tabPassphraseMode.classList.remove("active");
    charModeSection.classList.remove("hidden");
    passphraseModeSection.classList.add("hidden");
    generateNewPassword(true);
});

tabPassphraseMode.addEventListener("click", () => {
    if (currentMode === "passphrase") return;
    currentMode = "passphrase";
    tabPassphraseMode.classList.add("active");
    tabCharMode.classList.remove("active");
    passphraseModeSection.classList.remove("hidden");
    charModeSection.classList.add("hidden");
    generateNewPassword(true);
});

// Gaveta de Histórico
historyToggleBtn.addEventListener("click", () => {
    const isHidden = historyList.classList.contains("hidden");
    historyList.classList.toggle("hidden");
    historyToggleBtn.classList.toggle("open", isHidden);
    historyToggleBtn.setAttribute("aria-expanded", isHidden);
});

clearHistoryBtn.addEventListener("click", () => {
    recentPasswords = [];
    updateHistoryUI();
    showMessage("Histórico limpo!");
});

// Inicialização
initTheme();
generateNewPassword(false);