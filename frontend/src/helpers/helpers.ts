export function getQueryParam(
    locationSearch: string,
    keyWord: string,
  ): string | null {
    const cleanedLocationSearch = locationSearch
      .replace("/", "")
      .replace("?", "");
    const parsedStringArray = cleanedLocationSearch.split("&");
    const parsedDictArray = parsedStringArray.map((elt) => {
      const key = elt.split("=")[0];
      const value = elt.split("=")[1];
      return { [key]: value };
    });
    const queryDict: { [index: string]: string | null } = { [keyWord]: null };
    for (const item of parsedDictArray) {
      const key = Object.keys(item)[0];
      const value = Object.values(item)[0];
      if (key === keyWord) {
        queryDict[keyWord] = value;
      }
    }
    return queryDict[keyWord];
  }

  export function isValidUuid(uuid: string): boolean {
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    return uuidRegex.test(uuid);
  }
