# spelling-bee

The purpose of this repo is to re-implement the [New York Time's Spelling Bee game](https://www.nytimes.com/puzzles/spelling-bee)
Disclaimer: the games belongs to the New York Times, this repo is a mere hommage and coding exercice for academic purpose. 
As specified on their website, the rules are the following: 

## How to Play Spelling Bee
Create words using letters from the hive.
Words must contain at least 4 letters.
Words must include the center letter.
Our word list does not include words that are obscure, hyphenated, or proper nouns.
No cussing either, sorry.
Letters can be used more than once.
4-letter words are worth 1 point each.
Longer words earn 1 point per letter.
Each puzzle includes at least one “pangram” which uses every letter. These are worth 7 extra points!


## Game Setup
- The game is based on a preselection of words containing 7 different letters
Task: connect to Word API, get wordlist and filter it. Store the result locally. Select an appropriate datastructure.
- Out of the 7 letters, one is randomly selected to be the "mandatory" letter, which every guessed word must contain
Task: extract the 7 different letters out of the pangram and create an array of 7 letters from it. Randomly select 1 letter and put it aside. 
- Check whether a word (the user input):
    contains at least 4 letters
    includes the center letter
    contains no hyphens
    (is in the scrabble dictionary)
- If the word matches the condition: 
    assign points according to rules
    