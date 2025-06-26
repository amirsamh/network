document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#new-submit').setAttribute('disabled', 'true');

    document.addEventListener('keyup', () => {
        if (document.querySelector('#new-text').value === '') {
            document.querySelector('#new-submit').setAttribute('disabled', 'true');
        } else {
            document.querySelector('#new-submit').removeAttribute('disabled');
        }
    });
});