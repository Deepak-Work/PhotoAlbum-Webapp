// Configure AWS SDK
// AWS.config.update({
//   region: 
//   accessKeyId:
//   secretAccessKey:
// });

// Helper function to construct S3 URL
function getS3Url(bucketName, fileName) {
  const region = 'us-east-1'; // Your bucket's region
  return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
}

// Function to search photos
async function searchPhotos() {
  const query = document.getElementById('search-input').value;

  try {
    const response = await fetch(`https://j6y97h64q7.execute-api.us-east-1.amazonaws.com/dev/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to display search results
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  data.forEach(photo => {
    const img = document.createElement('img');
    console.log(photo);
    photo = photo._source;
    img.src = getS3Url(photo.bucket, photo.objectKey);
    img.alt = photo.labels.join(', ');
    resultsDiv.appendChild(img);
  });
}

// Function to upload a photo
async function uploadPhoto() {
  const file = document.getElementById('file-input').files[0];
  const customLabels = document.getElementById('custom-labels').value;

  if (!file) {
    console.error("No file selected.");
    return;
  }

  const filename = file.name;
  const fileType = file.type;
  const arrayBuffer = await file.arrayBuffer();

  try {
    const response = await fetch(`https://j6y97h64q7.execute-api.us-east-1.amazonaws.com/dev/photos?filename=${encodeURIComponent(filename)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
        'x-amz-meta-customLabels': customLabels,
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = response.status;
    console.log("Photo uploaded successfully", result);
  } catch (error) {
    console.error("Error uploading photo:", error);
  }
}

// Helper function to convert ArrayBuffer to Base64 (if needed)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
