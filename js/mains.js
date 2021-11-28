// Dimensions de la scène
const wST = 500;
const hST = 700;

// Référence les textures
let textures;

// Référencer les éléments
let ground, bird, pipe, gameOver, getReady;
// Référence les rectangles pour les collisions tuyaux/oiseau
let rTop, rBottom;

// Vitesses, accélaration, etc
let angle = 0, amplitude = 60;
let vX = 3, vY = 0, acc = 0.5, impulsion = -7;
let phaseJeu = 0; // 0:accueil, 1:jeu, 2:gameover

// Gestion des vies et des points
const nbLives = 5;
let idxLife = 0, tLives = [], nbPts = 0, scoreTxt;


// /////////////////////////////////////////////////////////////////// //
// /////////////////////////////////////////////////////////////////// //
// Ecouteur Clavier
window.addEventListener('keydown', function(e){
    console.log(e);
    if(e.keyCode === 32){
        if(phaseJeu === 0) {
            app.stage.removeChild(getReady);
            phaseJeu = 1;
        }

        vY = impulsion
    }
})

// Etape 01 - Création de l'application PIXI
const app = new PIXI.Application({
        width:wST,
        height:hST,
        backgroundColor:0x33CCFF
});
// Etape 02 - Ajout de la vue de l'appli au DOM
document.body.appendChild(app.view);

// Etape 03 - Chargement des actifs externes
const loader = PIXI.Loader.shared;
// Ajoute des fichiers à charger
loader.add('mySpriteSheet', 'assets/flappy_bird.json');
// Lance le chargement
loader.load((loader, resources) => {
    // Référence les textures
    textures = resources.mySpriteSheet.textures;
    // Initialise les éléments graphiques
    init();
    //testCrea();
});

function testCrea(){
    let tEnnemis = [];

    for(let i = 0 ; i < 60 ; i++){
        let b = new PIXI.Sprite(textures['bird0.png']);
        app.stage.addChild(b);
        b.x = (i % 8) * 60;
        b.y = Math.floor(i / 8) * 60;
        tEnnemis.push(b);
    }

    for(let [i,ennemi] of tEnnemis.entries()){
        //ennemi.alpha = i / tEnnemis.length
        ennemi.scale.set((i / tEnnemis.length) * 0.5 + 0.5)
    }
}


// /////////////////////////////////////////////////////////////////// //
// /////////////////////////////////////////////////////////////////// //
// Fonction d'initialisation
function init(){
    createBg();
    createPipe();
    createGround();
    createBird();
    createGetReady();
    createGameOver();
    createLives();
    createScore();

    // Lance la gameLoop
    app.ticker.add(() => {
        if(phaseJeu < 2){
            // Déplace le sol
            ground.x -= vX * 1.2;
            if(ground.x <= -120) { ground.x = 0 }
        }

        if(phaseJeu === 0){
            // Déplace l'oiseau
            bird.y = hST * 0.5 + Math.sin(angle) * amplitude;
            angle += 0.02;
        }
        else if(phaseJeu === 1){
            // Déplace les tuyaux
            pipe.x -= vX;
            // Si les tuyaux sortent de la scène
            if(pipe.x < -pipe.width * 0.5) {
                pipe.x = wST + pipe.width * 0.5;
                pipe.y = hST * 0.5 + rdm(-200, 200);
                // Augmente la vitesse de déplacement en X
                vX = Math.min(12, vX + 0.2);
                // Augmente les points
                nbPts++;
                scoreTxt.text = "Pts : " + nbPts;
            }

            // Déplace l'oiseau
            bird.y += vY;
            bird.rotation = vY * 0.042;
            vY = Math.min(20, vY + acc);

            // Pour empêcher l'oiseau de sortir par le haut
            if(bird.y <= bird.height * 0.5){
                bird.y = bird.height * 0.5 + 1;
                vY = 0;
            }

            // Détecte si l'oiseau touche le sol ou si il touche les tuyaux
            // Dans ce cas, afficher GameOver...
            if(bird.y + bird.height * 0.5 >= ground.y
                || collide(bird.getBounds(), rTop.getBounds()) 
                || collide(bird.getBounds(), rBottom.getBounds())
            ){
                pipe.x = wST + pipe.width * 0.5;
                pipe.y = hST * 0.5 + rdm(-200, 200);
                bird.y = hST * 0.5;
                vX = 3
                vY = 0;

                tLives[nbLives - (idxLife + 1)].alpha = 0.4;

                if(idxLife + 1 >= nbLives){
                    phaseJeu = 2;
                    app.stage.addChild(gameOver);
                }
                
                idxLife++;
            }
        }
    });
}


// /////////////////////////////////////////////////////////////////// //
// /////////////////////////////////////////////////////////////////// //
// Création de l'arrière plani
function createBg(){
    let bg = new PIXI.Sprite(textures['background.png']);
    // Ajoute le sprite sur la scène
    app.stage.addChild(bg);
}
// Création Sol
function createGround(){
    ground = new PIXI.Sprite(textures['ground.png']);
    ground.y = hST - ground.height * 0.7;
    app.stage.addChild(ground);
}
// Création des tuyaux
function createPipe(){
    pipe = new PIXI.Sprite(textures['pipe.png']);
    pipe.anchor.set(0.5);
    pipe.x = wST + pipe.width * 0.5;
    pipe.y = hST * 0.5 + rdm(-200, 200);
    app.stage.addChild(pipe);

    // Dessine les rectangles pour les collisions
    rTop = new PIXI.Graphics();
    rTop.x = -46;
    rTop.y = -572;
    rTop.beginFill(0, 0.0);
    rTop.drawRect(0, 0, 91, 486);
    pipe.addChild(rTop);

    rBottom = new PIXI.Graphics();
    rBottom.x = -46;
    rBottom.y = 86;
    rBottom.beginFill(0, 0.0);
    rBottom.drawRect(0, 0, 91, 486);
    pipe.addChild(rBottom);
}
// Création GameOver (au centre de la scène)
function createGameOver(){
    gameOver = new PIXI.Sprite(textures['game_over.png']);
    gameOver.anchor.set(0.5);
    gameOver.x = wST * 0.5;
    gameOver.y = hST * 0.5;
    //app.stage.addChild(gameOver);
}
// Création GetReady (au centre de la scène)
function createGetReady(){
    getReady = new PIXI.Sprite(textures['get_ready.png']);
    getReady.anchor.set(0.5);
    getReady.x = wST * 0.5;
    getReady.y = hST * 0.5;
    app.stage.addChild(getReady);
}
// Création de l'oiseau 
function createBird(){
    bird = new PIXI.AnimatedSprite(
        [
            textures['bird0.png'],
            textures['bird1.png'],
            textures['bird2.png'],
            textures['bird3.png']
        ]
    )
    bird.anchor.set(0.5);
    bird.x = wST * 0.3;
    bird.y = hST * 0.5;
    app.stage.addChild(bird);
    // Règle la vitesse de lecture
    bird.animationSpeed = 0.25;
    // Lance la lecture de la séquence
    bird.play();
}
// Création des vies
function createLives(){
    for(let i = 0 ; i < nbLives ; i++){
        let b = new PIXI.Sprite(textures['bird0.png']);
        b.scale.set(0.5);
        b.x = wST - (b.width + 5) * (i + 1);
        b.y = hST - 28;
        app.stage.addChild(b);
        tLives.push(b);
    }
}
// Création du score
function createScore(){
    scoreTxt = new PIXI.Text('Pts:' + nbPts,
        {fontFamily : 'Arial', fontSize: 14, fill: 0x1b1b1f, fontWeight:700}
    );
    scoreTxt.x = 5;
    scoreTxt.y = hST - scoreTxt.height - 10;
    app.stage.addChild(scoreTxt);
}


// /////////////////////////////////////////////////////////////////// //
// /////////////////////////////////////////////////////////////////// //
// UTILITAIRES

function rdm(x, y){
    return x + Math.random() * (y - x);
}
function d2R(v){
    return v / 180 * Math.PI;
}
function r2D(v){
    return v / Math.PI * 180;
}

function collide(r1, r2){
    return !(
        r1.x + r1.width < r2.x ||
        r2.x + r2.width < r1.x ||
        r1.y + r1.height < r2.y ||
        r2.y + r2.height < r1.y
    )
}

/*
// Dimension de la scene
const wST = 500;
const hST = 700;

// Referencement des textures
let textures;
let ground, bird, pipe, gameOver;
let angle = 0, amplitude = 60;
let vX = 3, vY = 0, acc = 1, impulsion = -10;
let phaseJeu = 0; //0=accueil 1=jeu 2=gameover
//Reference les rectangles pour collisions tuyaux oiseau
let rTop, rBottom;

//Ecouter Clavier
window.addEventListener('keyup', function(e){
    console.log(e)
    if(e.keyCode ===32){
        if(phaseJeu === 0) app.stage.removeChild(getready);

        phaseJeu = 1;
        vY = impulsion;
    }
})

// Etape 01 - Création de l'application PIXI
const app = new PIXI.Application(
    {
        width:wST,
        height:hST,
        backgroundColor:0x33CCFF
    }
)
// Etape 02 - ajout de la vue de l'appli au DOM
document.body.appendChild(app.view);

// Etape 03 - Chargement des actifs externes
const loader = PIXI.Loader.shared;
// Ajout des fichiers a charger
loader.add('mySpriteSheet', 'assets/flappy_bird.json');
//Lance le chargement
loader.load((loader, resources) =>{
    //Reference les textures
    textures = resources.mySpriteSheet.textures;
    //Initialisation des éléments graphiques
    init();
    //console.log(resources);
})


// Fonction d'initialisation
function init(){
    createBg();
    createPipe();
    createGr();
    createGameover();
    createGetready();
    createBird();
    createLives();

    //Lance la gameloop
    app.ticker.add(() => {
        // Déplace le sol
        ground.x -= vX * 1,2;
        if(ground.x <= -120) { ground.x = 0}
        //Déplace les tuyaux
        pipe.x -= vX;
        // Si les tuyaux sortent de la scene on les replace
        if(pipe.x <= -80) {
            pipe.y = hST/2 + rdm(-200, 200);

            pipe.x = wST * 1.2
            // Augmente vitesse déplacement en X
            vX += 1;
        }
        //Déplace l'oiseau
        if(phaseJeu === 0){
            bird.y = hST * 0.5 + Math.sin(angle) * amplitude;
            angle += 0.04;
        }
        else if(phaseJeu === 1){
            bird.y += vY
            bird.rotation = vY*0.04;
            vY = Math.min(10, vY + acc);

            if(bird.y <= bird.height * 0.5){
                bird.y = bird.height * 0.5 + 1;
                vY = 0;
            }

            //Detecte collision oiseau
            if(bird.y + bird.height * 0.5 >= ground.y
                || collide(bird.getBounds(), rTop.getBounds())
                || collide(bird.getBounds(), rBottom.getBounds())
            ){
                pipe.x = wST + pipe.width * 0.5;
                pipe.y = hST * 0.5 + rdm(-200, 200);
                bird.y = hST * 0.5;
                vX = 3;
                vY = 0;
            }
        }   
    });
}

// Création du background
function createBg(){
    let bg = new PIXI.Sprite(textures['background.png']);
    //Ajoute le sprite sur la scene
    app.stage.addChild(bg);

}
//Création Sol (en bas la)
function createGr(){
    ground = new PIXI.Sprite(textures['ground.png']);
    //Ajoute le sprite sur la scene
    ground.y = hST - ground.height * 0.7;
    app.stage.addChild(ground);
}
//Se déplace de la droite vers la gauche en continu
//Création des tuyaux
function createPipe(){
    pipe = new PIXI.Sprite(textures['pipe.png']);
    //Ajoute le sprite sur la scene
    app.stage.addChild(pipe);
    pipe.anchor.set(0.5);
    pipe.x = wST;
    //et changer leur position en Y aléatoirement
    pipe.y = hST/2 //+ rdm(-255, 255);

    //Dessiner les rectangle pour collision
    rTop = new PIXI.Graphics();
    rTop.x = -46;
    rTop.y = -572;
    rTop.beginFill(0, 0.5);
    rTop.drawRect(0, 0, 91, 486);
    pipe.addChild(rTop);

    rBottom = new PIXI.Graphics();
    rBottom.x = -46;
    rBottom.y = 86;
    rBottom.beginFill(0, 0.5);
    rBottom.drawRect(0, 0, 91, 486);
    pipe.addChild(rBottom);


}

function rdm(x,y){
    return x + Math.random() * (y - x);
}

function createGameover(){
    gameover = new PIXI.Sprite(textures['game_over.png']);
    //Ajoute le sprite sur la scene
    gameover.anchor.set(0.5);
    gameover.anchor.set(0.5);
    gameover.x = wST / 2;
    gameover.y = hST / 2;
}

function createGetready(){
    getready = new PIXI.Sprite(textures['get_ready.png']);
    //Ajoute le sprite sur la scene
    app.stage.addChild(getready);
    getready.anchor.set(0.5);
    getready.x = wST / 2;
    getready.y = hST / 2;
}

function createBird(){
    bird = new PIXI.AnimatedSprite(
        [
            textures['bird0.png'],
            textures['bird1.png'],
            textures['bird2.png'],
            textures['bird3.png'],
        ]
    )
    bird.anchor.set(0.5);
    bird.x = wST * 0.3;
    bird.y = hST * 0.5;
    app.stage.addChild(bird);
    //Vitesse d'animation du piaf
    bird.animationSpeed = 0.25;
    //Lancer l'animation
    bird.play();
}

function createLives(){
    for(let i = 0; i < 5; i++){
        let b = new PIXI.Sprite(textures['bird0.png']);
        b.scale.set(0.5);
        b.x = wST - (b.width + 5) * (i + 1);
        b.y = hST - 28;
        app.stage.addChild(b); 
        tLives.push(b);

    }

    /*live1 = new PIXI.Sprite(textures['bird0.png'])
    live1.anchor.set(0.5);
    app.stage.addChild(live1);
    live1.x = wST * 0.7;
    live1.y = hST * 0.97;

    live2 = new PIXI.Sprite(textures['bird0.png'])
    live2.anchor.set(0.5);
    app.stage.addChild(live2);
    live2.x = wST * 0.82;
    live2.y = hST * 0.97;

    live3 = new PIXI.Sprite(textures['bird0.png'])
    live3.anchor.set(0.5);
    app.stage.addChild(live3);
    live3.x = wST * 0.94;
    live3.y = hST * 0.97;
}

/*
function d2R(v){
    return v / 180 * Math.PI;
}

function r2D(v){
    return v / Math.PI * 180;
}

function collide(r1, r2){
    return!(
        r1.x + r1.width < r2.x ||
        r2.x + r2.width < r1.x ||
        r1.y + r1.height < r2.y ||
        r2.y + r2.height < r1.y
    )
}
*/
//Centrer verticalement et hors de champ a droite
//Se déplacent de la droite vers la gauche
//Quand ils sortent a gauche, les remplacer a droite
//et changer leur position en Y aléatoirement
//Création GameOver(centre de la scene)
//Création GetReady (centre de la scene)
//Création de l'oiseau 
//ATTENTION Utiliser AnimatedSprite et non Sprite (voir DOC)
//(30% du bord gauche de la scene)
//Centré verticalement 
