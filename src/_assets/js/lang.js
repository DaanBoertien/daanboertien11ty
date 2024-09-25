let userLang = navigator.language || navigator.userLanguage;
dutchElements = document.querySelectorAll('.nl');
englishElements = document.querySelectorAll('.en');
switchNL = document.querySelector('.switch-nl');
switchEN = document.querySelector('.switch-en');


window.lang = '';

// if (userLang === 'nl') {
//     lang = 'nl';
//     englishElements.forEach((el) => {
//         el.classList.add('hide');
//         console.log("English element hidden");
//     })
// } else {
//     lang = 'en';
//     dutchElements.forEach((el) => {
//         el.classList.add('hide');
//         console.log("Dutch element hidden");
//     })
// }

switchNL.addEventListener('click', () => {
        window.lang = 'nl'
        console.log('new language is ' + lang)
        englishElements.forEach((el) => {

                el.classList.add('hide');

                // el.classList.remove('show');
            
    })
    
    dutchElements.forEach((el) => {

            // el.classList.add('show');

            el.classList.remove('hide');
        
    })
    hamburger.classList.toggle("is-active");
 
    toggleTween(tl);
})

switchEN.addEventListener('click', () => {
        window.lang = 'en'
        console.log('new language is ' + lang)
        dutchElements.forEach((el) => {
                
                
                el.classList.add('hide');
     
                // el.classList.remove('show');
           
            
        })
        englishElements.forEach((el) => {
       
                el.classList.add('show');
         
                // el.classList.remove('hide');
            
        })
        hamburger.classList.toggle("is-active");

    toggleTween(tl);
    })
    

