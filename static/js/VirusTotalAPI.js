document.getElementById('file_upload_btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('excelUpload');
    const file = fileInput.files[0];

    if (file) {
        const apiKey = 'YOUR_VIRUSTOTAL_API_KEY'; // Replace with your VirusTotal API key
        const response = await scanFileWithVirusTotal(file, apiKey);
        console.log('VirusTotal Response:', response);
    }
});

async function scanFileWithVirusTotal(file, apiKey) {
    const formData = new FormData();
    formData.append('file', file);

    const url = "https://www.virustotal.com/vtapi/v2/file/scan?apikey=${apiKey}";
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const data = await response.json();
        return {
            isSafe: data.positives === 0,
            scanResult: data.scans
        };
    } else {
        throw new Error('Failed to scan file with VirusTotal.');
    };
}