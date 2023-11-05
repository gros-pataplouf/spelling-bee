def search_pangram(letterset):
    solutions = []
    with open('original_wordlist.txt', 'r') as in_file:
        for line in in_file.readlines():
            if len(line.strip()) > 6 and set(letterset) == set(line.strip()):
                solutions.append(line.strip())
    return solutions

print(search_pangram("iloqstu"))