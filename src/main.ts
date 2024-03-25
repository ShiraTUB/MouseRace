import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {AvoidElement, ChangeElement, CollectElement, Element, Game} from "./gameUtils"

let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let controls: OrbitControls

const raycaster = new THREE.Raycaster()
// raycaster.params.Mesh.threshold = 0.0001

const mouse = new THREE.Vector2()
const timerElement = document.getElementById("timer")
// const timerDivHeight = timerElement!.clientHeight
let animationFrameId: number | null = null // Store the current animation frame ID
let game: Game

// const availableHeight = window.innerHeight - timerDivHeight


function onMouseClick(event: MouseEvent): void {

    // Ignore any event related to the buttons
    if (event.target !== renderer.domElement) return

    mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
        let obj: any = intersects[0].object

        // Trigger the onClicked function of the intersected mesh's game element
        if (obj?.parent.onClicked) obj.parent.onClicked()

        // Check if the game is won by the current click
        if (checkGameWon()) {
            game.won = true
            game.end()
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth/ window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth , window.innerHeight)
}

function initGame() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId) // Cancel the previous animation loop
    }
    // Set camera and orbitControls
    camera.position.set(0, 0, 5)
    controls.update()

    // Initialize a new game
    game = new Game(15, scene)
    insertObjects(game.numberOfElement)

    animate()
}

function generateRandomPosition(): THREE.Vector3 {
    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 5
    const z = (Math.random() - 0.5) * 2

    return new THREE.Vector3(x, y, z)
}

function insertObjects(numberOfElement: number) {
    for (let i = 0; i < numberOfElement; i++) {

        // Randomly choose an element type
        const randomType = Math.floor(Math.random() * 3) // 0 -> Collect, 1 -> Avoid, 3 -> Change
        let newElement: Element

        switch (randomType) {
            case 0: // Collect
                newElement = new CollectElement(game)
                break
            case 1: // Avoid
                newElement = new AvoidElement(game)
                break
            case 2: // Change
                newElement = new ChangeElement(game)
                break
        }

        // Randomly position the new element in the scene
        newElement!.mesh.position.copy(generateRandomPosition())
        scene.add(newElement!)
    }
}

function checkGameWon(): boolean {
    // Check if there are any CollectElement or ChangeElement objects left
    let gameWon = true

    scene.traverse((obj: any) => {
        if (obj instanceof CollectElement || obj instanceof ChangeElement) {
            gameWon = false
        }
    })
    return gameWon
}

function animate() {
    // Animation loop
    animationFrameId = requestAnimationFrame(animate)
    scene.traverse((obj: any) => {
        if (obj.render) obj.render()
    })

    // Update timer display with clock's elapsed time
    if (!game.won && !game.lost) {
        if (timerElement) {
            const elapsed = game.timer.getElapsedTime() //elapsed time in seconds
            const minutes = Math.floor(elapsed / 60)
            const seconds = Math.floor(elapsed % 60)
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
    }

    renderer.render(scene, camera)
}

function main() {

    scene = new THREE.Scene()



    renderer = new THREE.WebGLRenderer()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    renderer.setSize(window.innerWidth, window.innerHeight)

    //renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    document.body.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)

    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('click', onMouseClick, false)
}

document.getElementById('startButton')!.addEventListener('click', () => {
    document.getElementById('startButton')!.style.display = 'none'
    initGame()
})

document.getElementById('lostButton')!.addEventListener('click', () => {
    document.getElementById('lostButton')!.style.display = 'none'
    initGame()
})

document.getElementById('wonButton')!.addEventListener('click', () => {
    document.getElementById('wonButton')!.style.display = 'none'
    initGame()
})

// call main entrypoint
main()
