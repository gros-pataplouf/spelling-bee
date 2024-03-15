import json
def get_solutions():
    solutions = []
    with open('original_wordlist.txt', 'r') as in_file:
        for line in in_file.readlines():
            if len(line.strip()) > 3:
                solutions.append(line.strip())
    return solutions


def has_min_20_solutions(letterset):
    solutions = get_solutions()
    counter = 0
    for solution in solutions:
        if set(solution).issubset(set(letterset)):
            counter += 1
            if counter == 20:
                return True
    return False





def make_lettersets():
    wordlist = []
    with open('original_wordlist.txt', 'r') as in_file:
        for line in in_file.readlines():
            if len(set(line.strip())) > 6:
                unique_letters = list(set(line.strip()))
                unique_letters.sort()
                wordlist.append("".join(unique_letters))
    wordlist.sort()
    unique_combos = []
    for idx, strg in enumerate(wordlist):
        if len(strg) == 7:
            if idx == 0 and has_min_20_solutions(strg):
                print(strg, idx, "/", len(wordlist))
                unique_combos.append(strg)
            elif wordlist[idx - 1] != wordlist[idx]:
                if has_min_20_solutions(strg):
                    print(strg, idx, "/", len(wordlist))
                    unique_combos.append(strg)
    with open('lettersets.json', 'w', encoding='utf-8') as f:
        json.dump(unique_combos, f, ensure_ascii=False, indent=4)

# make_lettersets()

def write_solutions():
    solutions = []
    with open('original_wordlist.txt', 'r') as in_file:
        for line in in_file.readlines():
            if len(line.strip()) > 3:
                solutions.append(line.strip())
    with open("solutions.json", "w", encoding="utf-8") as outfile:
        json.dump(solutions, outfile, ensure_ascii=False, indent=4)

# write_solutions()