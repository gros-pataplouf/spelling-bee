import Cell from './Cell'


const letterArray = Array.from("iloqstu")
console.log(letterArray)

function Game() {
    return (
    <div>
    <input id="input" placeholder="Type or click"/>
    <div id="hive">
        {letterArray.map(letter => <Cell letter={letter} key={letter}/>)}
    </div>
    </div>)
}

export default Game