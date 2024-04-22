import { srcInfo } from "./srcInfo.js"

let mouseX          = 0
let mouseY          = 0
let centerX         = 0
let centerY         = 0
let cursor          = 'auto'
let selectedCircle  = null
let clickedCircle   = null

const canvas        = document.getElementById('canvas')
const ctx           = canvas.getContext('2d')

let listOfComp      =  srcInfo.map( ob => ( { ...ob, select:false } ) )

const createMapSkills = () => {
    let skillsMap = {}
    srcInfo.forEach( ( item ) => {
        item.mainSkills.forEach( ( skill ) => {
            if ( !skillsMap[ skill ] ) {
                skillsMap[ skill ] = [{
                    name            : item.name,
                    skillType       : 1
                }]
            } else {
                if ( !skillsMap[ skill ].includes({
                    name            : item.name,
                    skillType       : 1
                })) {
                    skillsMap[ skill ].push({
                        name        : item.name,
                        skillType   : 1})
                }
            }
        })

        item.otherSkills.forEach( ( skill ) => {
            if ( !skillsMap[ skill ]) {
                skillsMap[ skill ] = [{
                    name            : item.name,
                    skillType       : 2
                }]
            } else {
                if ( !skillsMap[ skill ].includes({
                    name            : item.name,
                    skillType       : 2
                })) {
                    skillsMap[ skill ].push({
                        name        : item.name,
                        skillType   : 2
                    })
                }
            }
        })
    })

    let skillsArray = Object.keys( skillsMap ).map( ( skill ) => ({
        name            : skill,
        competence_m    : skillsMap[ skill ].filter( item => item.skillType === 1 ),
        competence_s    : skillsMap[ skill ].filter( item => item.skillType === 2 ),
        select          : false
    }))
    return skillsArray
}
let listOfSkills  =  createMapSkills()

const initCanvas = () => {
    canvas.width            = window.innerWidth
    canvas.height           = window.innerHeight  
    
    centerX                 = canvas.width / 2
    centerY                 = canvas.height / 2
   
    canvas.style.cursor     = cursor 
}

const mouseClickHandler = ( event )=>{
    if ( !selectedCircle ) {
        return
    }
    clickedCircle       = selectedCircle
    clickedCircle.init  = true
    clickedCircle.start = new Date().getTime()

    drawConcentricCircles()
}

canvas.addEventListener( 'mousemove', function( event ) {
    mouseX = event.clientX
    mouseY = event.clientY
    drawScene()
})

canvas.addEventListener( 'mouseup', mouseClickHandler )

window.addEventListener( 'resize', function() {
    drawScene()
})

const circle = ( x, y, r, w = 1, c = 'black' , fill=false ) => {
    ctx.lineWidth = w
    if ( fill ) {
        ctx.fillStyle = c
    } else {
        ctx.strokeStyle = c
    }
    ctx.beginPath()
    ctx.arc( x, y, r, 0, 2 * Math.PI )

    if ( fill ) {
        ctx.fill()
    } else {
        ctx.stroke()
    }
}

const distance = ( x1, x2, y1, y2 ) => { 
    return Math.sqrt( ( x1 - x2 ) ** 2 + ( y1 - y2 ) ** 2 )
}

const drawText = ( alfa, radius, text, color, bold ) => {

    const fontSize =  canvas.height / 60
    ctx.font = `${bold?'bold':''} ${fontSize}px Arial`
 
    let textList = text.split( ' ' ).reduce( ( acc, word ) => {
        if ( acc.length === 0 ) {
            acc.push( word )
        } else {
            let lastItem = acc[ acc.length - 1 ]
            if ( lastItem.length >=8 ) {
                acc.push( word )
            } else {
                acc[ acc.length - 1 ] = lastItem + ' ' + word
            }
        }
        return acc
    }, [])

    const textDistance = canvas.height / 30
    const x = centerX + ( radius + textDistance ) * Math.sin ( alfa ) 
    const y = centerY + ( radius + textDistance + textList.length * 7 ) * Math.cos ( alfa )

    ctx.textAlign = 'center'

    if ( alfa > Math.PI / 6 && alfa < 5 * Math.PI / 6 ) {
        ctx.textAlign = 'left'
    }

    if ( alfa > 7 * Math.PI / 6 && alfa < 11 * Math.PI / 6 ) {
        ctx.textAlign = 'right'
    }
    
    ctx.fillStyle = color
    
    for ( let i = 0; i < textList.length; i++ ){
        const showText = textList[ i ]
        ctx.fillText( showText, x, y + i * canvas.height / 60 )
    } 
}

const moveArray = ( arr, N ) => {    
    N = N % arr.length
    const firstPart     = arr.slice( -N )
    const secondPart    = arr.slice( 0, -N )
    return firstPart.concat( secondPart )
}

const drawInfo = ( list, type = 1 ) => {
    const rad = Math.min( 0.8 * centerX, 0.8 * centerY ) / type
    for ( let i = 0; i < list.length; i++ ) {
        const alfa          = i * 360 / list.length * Math.PI / 180
        const cX            = centerX + rad * Math.sin ( alfa ) 
        const cY            = centerY + rad * Math.cos ( alfa )
        let radius          = 15
        if ( distance ( cX, mouseX, cY, mouseY ) < radius  && !selectedCircle ) {
            radius          = 16
            cursor          = 'pointer'
            selectedCircle  = { type:type, index: i}
        } 

        if ( clickedCircle && clickedCircle.type === type && clickedCircle.index === i || list[i].select ) {
            const mainColor = type === 2 ? '#00A272' : '#FF7A01'          
            circle( cX, cY, 15, 2, mainColor, 1 )
            if ( !list[i].select ) {
                circle( cX, cY, 17, 1, mainColor )
            }
        } else {
            const mainColor = type === 2 ? '#ADADAD' : '#FFD4AC'
            circle( cX, cY, radius, 2, mainColor, 1 )
        }
        
        const bold = type === 2 ? true : false
        drawText( alfa, rad, list[i].name, "#30281C", bold )
    }
}

const drawLines = ( ) => {
    ctx.clearRect( 0, 0, canvas.width, canvas.height )
    const { type, index } = clickedCircle 
    
    if (type === 1) {
        const rad   = Math.min( 0.8 * centerX, 0.8 * centerY )
        const rad2  = Math.min( 0.8 * centerX, 0.8 * centerY )/2
        const alfa  = index * 360 / listOfSkills.length * Math.PI / 180
        const cX    = centerX + rad * Math.sin ( alfa ) 
        const cY    = centerY + rad * Math.cos ( alfa )
        
        ctx.lineWidth = 2
        
        for ( let i = 0; i < listOfComp.length; i++ ) {           
            if ( listOfComp[i].select > 0 ) {                
                const alfa  = i * 360 / listOfComp.length * Math.PI / 180
                const cX1   = centerX + rad2 * Math.sin ( alfa ) 
                const cY1   = centerY + rad2 * Math.cos ( alfa )

                //todo recalculate coord to animation
                const cX2   = cX1
                const cY2   = cY1

                const c_color   = listOfComp[i].select == 1 ? "#F99654" : "#915bb9" 
                ctx.strokeStyle = c_color
                ctx.beginPath()
                ctx.moveTo( cX, cY )                
                
                const controlX1 = cX + ( cX2 - cX ) * 0.51
                const controlY1 = cY + ( cY2 - cY ) * 0.01
                const controlX2 = cX + ( cX2 - cX ) * 0.99
                const controlY2 = cY + ( cY2 - cY ) * 0.51
                ctx.bezierCurveTo( controlX1, controlY1, controlX2, controlY2, cX2, cY2 )
                ctx.stroke()
            }
        }
    }
    
    if (type === 2) {
        const rad   = Math.min( 0.8 * centerX, 0.8 * centerY )/2
        const rad2  = Math.min( 0.8 * centerX, 0.8 * centerY )
        const alfa  = index * 360 / listOfComp.length * Math.PI / 180
        const cX    = centerX + rad * Math.sin ( alfa ) 
        const cY    = centerY + rad * Math.cos ( alfa )
        
        ctx.lineWidth = 2
        
        for ( let i = 0; i < listOfSkills.length; i++ ) {           
            if ( listOfSkills[i].select>0 ) {
                const alfa  = i * 360 / listOfSkills.length * Math.PI / 180
                const cX2   = centerX + rad2 * Math.sin ( alfa ) 
                const cY2   = centerY + rad2 * Math.cos ( alfa )

                const c_color   = listOfSkills[i].select == 1 ? "#F99654" : "#915bb9" 
                ctx.strokeStyle = c_color
                ctx.beginPath()
                ctx.moveTo( cX, cY )

                const controlX1 = cX + ( cX2 - cX ) * 0.4
                const controlY1 = cY + ( cY2 - cY ) * 0.6
                const controlX2 = cX + ( cX2 - cX ) * 0.6
                const controlY2 = cY + ( cY2 - cY ) * 0.4
                ctx.bezierCurveTo( controlX1, controlY1, controlX2, controlY2, cX2, cY2 )
                ctx.stroke()
            }
        }
    }
}

const sortAndShow = () => {
    if ( clickedCircle?.init )  {

        listOfSkills.forEach( ob => ob.select=0 )
        listOfComp.forEach(   ob => ob.select=0 )

        if (clickedCircle.type === 1) {
            const selected = listOfSkills[ clickedCircle.index ]
            let lengthRow = 0
            for( let i = 0; i < selected.competence_m.length; i++ ){
                const selComp   = listOfComp.find( ob => ob.name === selected.competence_m[i].name )
                selComp.select  = 1   
                lengthRow++
            }
            for( let i = 0; i < selected.competence_s.length;i++ ){
                const selComp   = listOfComp.find( ob => ob.name === selected.competence_s[i].name )
                selComp.select  = 2
                lengthRow++
            }
         
            listOfComp.sort( ( a, b ) => {               
                if ( a.select > b.select ) {
                    return -1
                }                
                if ( a.select < b.select ) {
                    return 1
                }                
                return 0
            })

            const nMov = Math.round( clickedCircle.index * listOfComp.length / listOfSkills.length - lengthRow / 2 + 0.5 )

            listOfComp = moveArray( listOfComp,nMov )
        }
        
        if ( clickedCircle.type === 2 ) {
            const selected = listOfComp[ clickedCircle.index ]
            let lengthRow = 0
            
            for( let i = 0; i < selected.mainSkills.length; i++ ){
                const selComp   = listOfSkills.find( ob => ob.name === selected.mainSkills[i] )
                selComp.select  = 1 
                lengthRow++
            }
     
            for( let i = 0; i < selected.otherSkills.length; i++){
                const selComp   = listOfSkills.find( ob => ob.name === selected.otherSkills[i] )
                selComp.select  = 2 
                lengthRow++
            }

           listOfSkills.sort( ( a, b ) => {               
                if ( a.select > b.select ) {
                    return -1
                }                
                if ( a.select < b.select ) {
                    return 1
                }                
                return 0
            })
            const nMov = Math.round ( clickedCircle.index * listOfSkills.length / listOfComp.length - lengthRow / 2 + 0.5 )
            listOfSkills = moveArray( listOfSkills,nMov )
        }
        clickedCircle.init = false
    }

    if ( clickedCircle ) {
        drawLines()
    } 

    const maxRadius     = Math.min( 0.8 * centerX, 0.8 * centerY )
    const numCircles    = 2
    for ( let i = 0; i < numCircles; i++ ) {
        const radius = maxRadius * ( i + 1 ) / numCircles
        circle( centerX, centerY, radius, 2, "#adadad" )
    }   
    drawInfo( listOfComp, 2 )
    drawInfo( listOfSkills, 1 )

}

const drawConcentricCircles = (x, y) => {
    cursor          = 'auto'
    selectedCircle  = null
    sortAndShow()
}

const drawScene = () =>{
    initCanvas()
    drawConcentricCircles( canvas.width / 2, canvas.height / 2 )
}

drawScene()