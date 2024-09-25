const iframe = document.querySelector('.iframe')
const iframeContainer = document.querySelector('.iframe-container')
const thumbnail = document.querySelector('.youtubethumbnail')
console.log(iframeContainer)

// if (thumbnail){
// thumbnail.addEventListener('click',  (e) => {
//     console.log(e.target)
//     // console.log(iframe.parentNode)
//     thumbnail.parentNode.removeChild(thumbnail)
    
// })
// }
body.addEventListener('click', (e) => {
    console.log(e.target)
})
thumbnail.addEventListener('click', (e) => {
    console.log(e.target)
    e.stopPropagation()
})