function getListItemElem(f) {
  const elem = document.createElement('li');
  const link = document.createElement('a');
  link.textContent = f;
  link.href = '/up/'+encodeURIComponent(f);
  link.setAttribute('download', f);
  elem.appendChild(link);
  return elem;
}

async function main() {
  const fileElemLabel = document.querySelector('#file-to-upload-label');
  const progressPercentElem = document.querySelector('#progress-percent');
  const fileElem = document.querySelector('#file-to-upload');

  const uploadedFilesElem = document.querySelector('#uploaded-files');
  const resp = await fetch('/uploaded');
  const fs = await resp.json();
  fs.forEach(f => uploadedFilesElem.appendChild(getListItemElem(f)));

  fileElem.addEventListener('change', () => fileElemLabel.textContent = fileElem.files[0].name);
  const up = document.querySelector('#upload-progress');
  const fr = document.querySelector('#file-upload-form');
  fr.addEventListener('submit', e => {
    e.preventDefault();
    progressPercentElem.textContent = '';
    up.value = 0;
    console.log('form submitted');
    const formData = new FormData();
    formData.set('file', fileElem.files[0]);
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", transferComplete);
    xhr.addEventListener("error", transferFailed);
    xhr.addEventListener("abort", transferCanceled);
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        const percentComplete = Math.round(((e.loaded / e.total * 100) + Number.EPSILON) * 100) / 100;
        progressPercentElem.textContent = `${percentComplete}%`;
        up.value = percentComplete;
      } else {
        console.log('oops', e);
      }
    });
    xhr.open('POST', '/upload');
    xhr.send(formData);
  });
}


function transferComplete(evt) {
  console.log("The transfer is complete.");
}

function transferFailed(evt) {
  console.log("An error occurred while transferring the file.");
}

function transferCanceled(evt) {
  console.log("The transfer has been canceled by the user.");
}

main();