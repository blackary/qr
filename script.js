let qrCode;
let centerImage;
let isInitialLoad = true;

function generateQR() {
    const text = document.getElementById('qr-text').value;
    const qrColor = document.getElementById('qr-color').value;
    const bgColor = document.getElementById('bg-color').value;
    const borderRadius = document.getElementById('border-radius').value;
    const qrStyle = document.getElementById('qr-style').value;

    if (!text) return; // Don't generate if text is empty

    qrCode = qrcode(0, 'M');
    qrCode.addData(text);
    qrCode.make();

    const qrContainer = document.getElementById('qr-container');
    const moduleCount = qrCode.getModuleCount();
    const cellSize = 8;
    const margin = 4;
    const size = moduleCount * cellSize + 2 * margin;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.style.backgroundColor = bgColor;

    // Apply border radius to the SVG element
    svg.style.borderRadius = `${borderRadius}px`;

    // Create a rounded rectangle for the background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', size);
    bgRect.setAttribute('height', size);
    bgRect.setAttribute('fill', bgColor);
    bgRect.setAttribute('rx', borderRadius);
    bgRect.setAttribute('ry', borderRadius);
    svg.appendChild(bgRect);

    // Create background rect
    const bgRect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect2.setAttribute('width', '100%');
    bgRect2.setAttribute('height', '100%');
    bgRect2.setAttribute('fill', bgColor);
    svg.appendChild(bgRect2);

    // Create QR code
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qrCode.isDark(row, col)) {
                let element;
                switch (qrStyle) {
                    case 'dotted':
                        element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        element.setAttribute('cx', margin + col * cellSize + cellSize / 2);
                        element.setAttribute('cy', margin + row * cellSize + cellSize / 2);
                        element.setAttribute('r', cellSize / 2);
                        break;
                    case 'rounded':
                        element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        element.setAttribute('x', margin + col * cellSize);
                        element.setAttribute('y', margin + row * cellSize);
                        element.setAttribute('width', cellSize);
                        element.setAttribute('height', cellSize);
                        element.setAttribute('rx', cellSize / 4);
                        element.setAttribute('ry', cellSize / 4);
                        break;
                    default: // standard
                        element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        element.setAttribute('x', margin + col * cellSize);
                        element.setAttribute('y', margin + row * cellSize);
                        element.setAttribute('width', cellSize);
                        element.setAttribute('height', cellSize);
                }
                element.setAttribute('fill', qrColor);
                svg.appendChild(element);
            }
        }
    }

    qrContainer.innerHTML = '';
    qrContainer.appendChild(svg);

    if (centerImage) {
        const imageSize = size * 0.2;
        const imageX = (size - imageSize) / 2;
        const imageY = (size - imageSize) / 2;

        const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        imageElement.setAttributeNS(null, 'x', imageX);
        imageElement.setAttributeNS(null, 'y', imageY);
        imageElement.setAttributeNS(null, 'width', imageSize);
        imageElement.setAttributeNS(null, 'height', imageSize);
        imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', centerImage);

        // Create a white background for the center image
        const imageBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        imageBg.setAttributeNS(null, 'x', imageX);
        imageBg.setAttributeNS(null, 'y', imageY);
        imageBg.setAttributeNS(null, 'width', imageSize);
        imageBg.setAttributeNS(null, 'height', imageSize);
        imageBg.setAttributeNS(null, 'fill', 'white');

        svg.appendChild(imageBg);
        svg.appendChild(imageElement);
    } else {
        // Remove any existing center image if it was cleared
        const existingImage = svg.querySelector('image');
        const existingImageBg = svg.querySelector('rect:not(:first-child)');
        if (existingImage) svg.removeChild(existingImage);
        if (existingImageBg) svg.removeChild(existingImageBg);
    }
}

function saveToHistory() {
    const text = document.getElementById('qr-text').value;
    const qrColor = document.getElementById('qr-color').value;
    const bgColor = document.getElementById('bg-color').value;
    const borderRadius = document.getElementById('border-radius').value;
    const qrStyle = document.getElementById('qr-style').value;

    const history = JSON.parse(localStorage.getItem('qrHistory')) || [];
    const newEntry = {
        text,
        qrColor,
        bgColor,
        borderRadius,
        centerImage,
        qrStyle,
        timestamp: new Date().toISOString() // Add timestamp
    };

    // Check if the entry already exists in the history
    const isDuplicate = history.some(item =>
        item.text === text &&
        item.qrColor === qrColor &&
        item.bgColor === bgColor &&
        item.borderRadius === borderRadius &&
        item.centerImage === centerImage &&
        item.qrStyle === qrStyle
    );

    if (!isDuplicate) {
        history.push(newEntry);
        localStorage.setItem('qrHistory', JSON.stringify(history));
        displayHistory();
        alert('QR code saved to history!');
    } else {
        alert('This QR code already exists in history.');
    }
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem('qrHistory')) || [];
    const historyContainer = document.getElementById('history');
    historyContainer.innerHTML = '';

    if (history.length === 0) {
        historyContainer.innerHTML = '<p>No history available.</p>';
    } else {
        // Sort history from most recent to least recent
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        history.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'history-item';

            const date = new Date(item.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

            itemElement.innerHTML = `
                <span class="history-text">${index + 1}. ${item.text}${item.centerImage ? ' (with image)' : ''}</span>
                <span class="history-date">${formattedDate}</span>
                <button class="delete-history-item" onclick="deleteHistoryItem(${index})">Delete</button>
            `;
            itemElement.querySelector('.history-text').onclick = () => loadHistoryItem(item);
            historyContainer.appendChild(itemElement);
        });
    }
}

function loadHistoryItem(item) {
    document.getElementById('qr-text').value = item.text;
    document.getElementById('qr-color').value = item.qrColor;
    document.getElementById('bg-color').value = item.bgColor;
    document.getElementById('border-radius').value = item.borderRadius;
    document.getElementById('qr-style').value = item.qrStyle || 'standard';
    centerImage = item.centerImage;

    // Update color value inputs
    document.getElementById('qr-color-value').value = item.qrColor.toUpperCase();
    document.getElementById('bg-color-value').value = item.bgColor.toUpperCase();

    // Update border radius value display
    document.getElementById('border-radius-value').textContent = item.borderRadius;

    // Handle center image
    const fileNameSpan = document.getElementById('file-name');
    const clearImageBtn = document.getElementById('clear-image');
    if (item.centerImage) {
        fileNameSpan.textContent = 'Image loaded';
        clearImageBtn.style.display = 'inline';
    } else {
        fileNameSpan.textContent = '';
        clearImageBtn.style.display = 'none';
    }

    // Clear the file input
    document.getElementById('center-image').value = '';

    generateQR();
}

function deleteHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('qrHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('qrHistory', JSON.stringify(history));
    displayHistory();
}

function setupEventListeners() {
    const inputs = ['qr-text', 'qr-color', 'bg-color', 'border-radius', 'qr-style'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', (event) => {
            if (id === 'border-radius') {
                document.getElementById('border-radius-value').textContent = event.target.value;
            }
            generateQR();
            saveCurrentSettings();
        });
    });

    document.getElementById('center-image').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                centerImage = e.target.result;
                generateQR();
                saveCurrentSettings();
            };
            reader.readAsDataURL(file);
            document.getElementById('file-name').textContent = file.name;
            document.getElementById('clear-image').style.display = 'inline';
        }
    });

    ['qr-color', 'bg-color'].forEach(id => {
        const colorInput = document.getElementById(id);
        const colorValue = document.getElementById(`${id}-value`);

        // Update text input when color picker changes
        colorInput.addEventListener('input', (event) => {
            colorValue.value = event.target.value.toUpperCase();
            generateQR();
        });

        // Update color picker when text input changes
        colorValue.addEventListener('input', (event) => {
            let color = event.target.value;
            if (color.charAt(0) !== '#') {
                color = '#' + color;
            }
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                colorInput.value = color;
                generateQR();
            }
        });
    });
}

function clearHistory() {
    localStorage.removeItem('qrHistory');
    displayHistory(); // Refresh the history display
}

function clearCenterImage() {
    centerImage = null;
    document.getElementById('center-image').value = '';
    document.getElementById('file-name').textContent = '';
    document.getElementById('clear-image').style.display = 'none';
    generateQR();
    saveCurrentSettings();
}

function toggleDropdown() {
    document.getElementById("saveDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function downloadQR() {
    const text = document.getElementById('qr-text').value;
    let filename = 'qr-code.png';

    if (text) {
        // Remove http://, https://, www., and the TLD
        let cleanText = text.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\.[^.]+$/, '');

        // Remove any remaining problematic characters
        cleanText = cleanText.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Limit the length of the filename
        cleanText = cleanText.substring(0, 50);

        filename = `qr_${cleanText}.png`;
    }

    html2canvas(document.getElementById('qr-container')).then(canvas => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    });
}

function copyQR() {
    html2canvas(document.getElementById('qr-container')).then(canvas => {
        canvas.toBlob(function(blob) {
            // Try to use the new Clipboard API
            if (navigator.clipboard && navigator.clipboard.write) {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(function() {
                    showMessage("QR code copied to clipboard!", "success");
                }, function(error) {
                    console.error("Unable to copy QR code: ", error);
                    fallbackCopyMethod(canvas);
                });
            } else {
                // Fallback for browsers that don't support the Clipboard API
                fallbackCopyMethod(canvas);
            }
        });
    });
}

function fallbackCopyMethod(canvas) {
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        showMessage(`
            Unable to copy image directly to clipboard.
            <br><br>
            Please follow these steps:
            <ol>
                <li>Right-click on the QR code image</li>
                <li>Select "Copy image" from the context menu</li>
                <li>Paste the image where you need it</li>
            </ol>
            <a href="${url}" download="qr-code.png">Alternatively, click here to download the QR code</a>
        `, "info");
    });
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.padding = '15px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.maxWidth = '80%';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.zIndex = '1000';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4CAF50';
        messageDiv.style.color = 'white';
    } else if (type === 'info') {
        messageDiv.style.backgroundColor = '#2196F3';
        messageDiv.style.color = 'white';
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 5000);
}

function shareQR() {
    html2canvas(document.getElementById('qr-container')).then(canvas => {
        canvas.toBlob(function(blob) {
            const file = new File([blob], "qr-code.png", { type: "image/png" });
            const shareData = {
                files: [file],
            };
            if (navigator.canShare && navigator.canShare(shareData)) {
                navigator.share(shareData)
                    .then(() => console.log('QR code shared successfully'))
                    .catch((error) => console.log('Error sharing QR code:', error));
            } else {
                alert("Sharing is not supported on this device/browser.");
            }
        });
    });
}

function saveCurrentSettings() {
    const settings = {
        text: document.getElementById('qr-text').value,
        qrColor: document.getElementById('qr-color').value,
        bgColor: document.getElementById('bg-color').value,
        borderRadius: document.getElementById('border-radius').value,
        qrStyle: document.getElementById('qr-style').value,
        centerImage: centerImage
    };
    localStorage.setItem('qrSettings', JSON.stringify(settings));
}

function getRecentSettings() {
    const history = JSON.parse(localStorage.getItem('qrHistory')) || [];
    if (history.length > 0) {
        // Sort history from most recent to least recent
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return history[0]; // Return the most recent entry
    }
    return null;
}

function loadCurrentSettings() {
    const settings = JSON.parse(localStorage.getItem('qrSettings')) || {};
    document.getElementById('qr-text').value = settings.text || '';
    document.getElementById('qr-color').value = settings.qrColor || '#000000';
    document.getElementById('bg-color').value = settings.bgColor || '#ffffff';
    document.getElementById('border-radius').value = settings.borderRadius || 0;
    document.getElementById('qr-style').value = settings.qrStyle || 'standard';
    centerImage = settings.centerImage || null;

    // Update color value inputs
    document.getElementById('qr-color-value').value = (settings.qrColor || '#000000').toUpperCase();
    document.getElementById('bg-color-value').value = (settings.bgColor || '#ffffff').toUpperCase();

    // Update border radius value display
    document.getElementById('border-radius-value').textContent = settings.borderRadius || 0;

    // Handle center image
    const fileNameSpan = document.getElementById('file-name');
    const clearImageBtn = document.getElementById('clear-image');
    if (settings.centerImage) {
        fileNameSpan.textContent = 'Image loaded';
        clearImageBtn.style.display = 'inline';
    } else {
        fileNameSpan.textContent = '';
        clearImageBtn.style.display = 'none';
    }

    // Clear the file input
    document.getElementById('center-image').value = '';

    generateQR();
}

window.onload = () => {
    if (isInitialLoad) {
        const recentSettings = getRecentSettings();
        if (recentSettings) {
            loadHistoryItem(recentSettings);
        } else {
            generateQR(); // Generate initial QR code with default settings
        }
        isInitialLoad = false;
    } else {
        // Load current settings from localStorage
        loadCurrentSettings();
    }
    displayHistory();
    setupEventListeners();
};