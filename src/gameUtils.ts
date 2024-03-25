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
    boxGeometry: THREE.BoxGeometry
    sphereGeometry: THREE.SphereGeometry
    cylinderGeometry: THREE.CylinderGeometry

    collectMaterial: THREE.MeshBasicMaterial
    avoidMaterial: THREE.MeshBasicMaterial


    constructor(elementsNum: number, scene: THREE.Scene) {
        this.timer = new THREE.Clock
        this.scene = scene
        this.numberOfElement = elementsNum

        // geometries and materials
        this.boxGeometry = new THREE.BoxGeometry(1, 1, 1)
        this.sphereGeometry = new THREE.SphereGeometry(1, 50, 50)
        this.cylinderGeometry = new THREE.CylinderGeometry(0, 1, 1, 4, 4)

        this.collectMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color('red')})
        this.avoidMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color('green')})
    }

    end() {
        // Delete all the meshes in the scene and remove the elements
        // scene.traverse
        // this.scene.traverse((child: any) =>{
        //     if (child instanceof Element){
        //         child.delete()
        //     }
        // })
        while (this.scene.children.length > 0) {
            this.avoidMaterial.dispose()
            this.collectMaterial.dispose()

            this.boxGeometry.dispose()
            this.cylinderGeometry.dispose()
            this.sphereGeometry.dispose()

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
        this.game.scene.remove(this)
    }
}

export class CollectElement extends Element {

    child: any
    constructor(game: Game) {

        // create a mesh of random size
        const randomSize = Math.random() + 0.2
        let box = new THREE.Mesh(game.boxGeometry, game.collectMaterial)
        box.scale.set(randomSize, randomSize, randomSize)

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
        this.game.scene.remove(this)
    }
}

export class AvoidElement extends Element {
    constructor(game: Game) {
        const randomSize = Math.random() + 0.2
        const sphere = new THREE.Mesh(game.sphereGeometry, game.avoidMaterial)
        sphere.scale.set(randomSize, randomSize, randomSize)
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
        const randomSize = Math.random() + 0.2

        const type = Math.round(Math.random()) // chose a type randomly; 0 -> collect, 1 -> avoid
        const material = type == 0 ? game.collectMaterial : game.avoidMaterial
        const pyramid = new THREE.Mesh(game.cylinderGeometry, material)
        pyramid.scale.set(randomSize, randomSize, randomSize)
        super(pyramid, type, game)
        this.update()

    }

    update() {
        setInterval(() => {
            // Every few seconds, change the type and color respectively
            if (this.elementType == ElementType.Collect) {
                this.elementType = ElementType.Avoid
                this.mesh.material = this.game.avoidMaterial
            } else {
                this.elementType = ElementType.Collect
                this.mesh.material = this.game.collectMaterial
            }
        }, 4000)
    }

    render(): void {
        // Rotate the pyramid clockwise
        this.mesh.rotation.z -= 0.01
    }

    onClicked(): void {
        // When a collect elements is clicked, remove is from the scene
        if (this.elementType === ElementType.Collect) {
            this.game.scene.remove(this)
        } else {
            this.game.lost = true
            this.game.end()
        }
    }
}
