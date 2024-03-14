import * as THREE from 'three'

export enum ElementType {
    Collect,
    Avoid
}

const minX = -5, maxX = 5, minY = -2, maxY = 3, minZ = -1, maxZ = 1

export class Game {

    timer: THREE.Clock
    won: boolean = false
    lost: boolean = false
    scene: THREE.Scene
    numberOfElement: number

    constructor(elementsNum: number, scene: THREE.Scene) {
        this.timer = new THREE.Clock
        this.scene = scene
        this.numberOfElement = elementsNum
    }

    end() {
        // Delete all the meshes in the scene and remove the elements
        while (this.scene.children.length > 0) {
            const element_to_delete = this.scene.children[0]
            if (element_to_delete instanceof Element){
                element_to_delete.delete()
            }
        }
        if (this.lost) {
            // Lost button
            document.getElementById('lostButton')!.style.display = 'block'
        } else {
            // Won button
            document.getElementById('wonButton')!.style.display = 'block'
        }
    }
}

export class Element extends THREE.Object3D {
    mesh: THREE.Mesh
    elementType: ElementType
    direction: string
    game: Game

    constructor(mesh: THREE.Mesh, type: ElementType, game: Game) {
        super()
        this.mesh = mesh
        this.elementType = type
        this.direction = ""
        this.game = game
        this.add(this.mesh)
    }

    render(): void {
        // Placeholder for child classes to implement movement
    }

    update(): void {
        // Placeholder for child classes to implement updates

    }

    onClicked(): void {
        // Placeholder for child classes to implement click behavior
    }

    delete(): void {
        (this.mesh.material as THREE.MeshBasicMaterial).dispose()
        this.mesh.geometry.dispose()
        this.game.scene.remove(this)
    }
}

export class CollectElement extends Element {
    constructor(game: Game) {
        // create a mesh of random size
        const randomSize = Math.random() * 0.5 + 0.4
        const geometry = new THREE.BoxGeometry(randomSize, randomSize, randomSize)
        const material = new THREE.MeshBasicMaterial({color: new THREE.Color('red')})
        const box = new THREE.Mesh(geometry, material)
        super(box, ElementType.Collect, game)
        this.update()
    }

    update(): void {
        const directions = ['up', 'down', 'left', 'right', 'forward', 'backward']

        let lastIndex = 0
        this.direction = 'up'

        setInterval(() => {
            let randomIndex
            do {
                // choose randomly a different direction
                randomIndex = Math.floor(Math.random() * 6)
            } while (randomIndex === lastIndex) // Ensure a different index is chosen

            lastIndex = randomIndex
            this.direction = directions[randomIndex]
        }, 2000) // change direction every two seconds
    }

    render(): void {
        switch (this.direction) {
            case 'up':
                if (this.mesh.position.y < maxY) {
                    this.mesh.position.y += 0.01
                }
                break
            case 'down':
                if (this.mesh.position.y > minY) {
                    this.mesh.position.y -= 0.01
                }
                break
            case 'left':
                if (this.mesh.position.x < maxX) {
                    this.mesh.position.x += 0.01
                }
                break
            case 'right':
                if (this.mesh.position.x > minX) {
                    this.mesh.position.x -= 0.01
                }
                break
            case 'forward':
                if (this.mesh.position.z < maxZ) {
                    this.mesh.position.z += 0.01
                }
                break
            case 'backward':
                if (this.mesh.position.z > minZ) {
                    this.mesh.position.z -= 0.01
                }
                break
        }
    }

    onClicked(): void {
        this.delete()
    }
}

export class AvoidElement extends Element {
    constructor(game: Game) {
        const randomSize = Math.random() * 0.5 + 0.2
        const geometry = new THREE.SphereGeometry(randomSize, 50, 50)
        const material = new THREE.MeshBasicMaterial({color: new THREE.Color('green')})
        const sphere = new THREE.Mesh(geometry, material)
        super(sphere, ElementType.Avoid, game)
        this.update()
    }

    update() {
        this.direction = 'left'
        // Change direction every 3 seconds
        setInterval(() => {
            this.direction = this.direction == 'left' ? 'right' : 'left'
        }, 3000) // change direction from left to right every three seconds
    }

    render(): void {
        switch (this.direction) {
            case 'left':
                if (this.mesh.position.x < maxX) {
                    this.mesh.position.x += 0.01
                }
                break
            case 'right':
                if (this.mesh.position.x > minX) {
                    this.mesh.position.x -= 0.01
                }
                break
        }
    }

    onClicked(): void {
        // When an avoid element is clicked, the game is lost
        this.game.lost = true
        this.game.end()
    }
}

export class ChangeElement extends Element {
    constructor(game: Game) {
        const randomSize = Math.random() * 0.5 + 0.4
        const geometry = new THREE.CylinderGeometry(0, randomSize, randomSize, 4, 4)

        const type = Math.round(Math.random()) // chose a type randomly; 0 -> collect, 1 -> avoid
        const color = type == 0 ? 'red' : 'green'
        const material = new THREE.MeshBasicMaterial({color: new THREE.Color(color)})
        const pyramid = new THREE.Mesh(geometry, material)
        super(pyramid, type, game)
        this.update()

    }

    update() {
        setInterval(() => {
            // Every few seconds, change the type and color respectively
            if (this.elementType == ElementType.Collect) {
                this.elementType = ElementType.Avoid
                this.mesh.material = new THREE.MeshBasicMaterial({color: new THREE.Color('green')})
            } else {
                this.elementType = ElementType.Collect
                this.mesh.material = new THREE.MeshBasicMaterial({color: new THREE.Color('red')})
            }
        }, 4000)
    }

    render(): void {
        // Rotate the pyramid clockwise
        this.mesh.rotation.z -= (Math.PI / 180)
    }

    onClicked(): void {
        // When a collect elements is clicked, remove is from the scene
        if (this.elementType === ElementType.Collect) {
            this.delete()
        } else {
            this.game.lost = true
            this.game.end()
        }
    }
}
