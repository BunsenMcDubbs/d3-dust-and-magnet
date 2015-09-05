import csv
import json

items = []
f = open('test.js', 'w')
f.write("test = ")
headers = []

with open("carNEW.txt", "rU") as tsv:
    reader = csv.reader(tsv, delimiter="\t")
    for line in reader:
        if len(headers) == 0:
            for header in line:
                """<fieldname>, <min>, <max>"""
                headers.append([header, None, None])
        else:
            car = {}
            raw = {}
            normalized = []
            car["name"] = line[0]
            for i in xrange(1, len(headers)):
                entry = line[i]
                if entry != "":
                    entry = float(entry)
                    raw[headers[i][0]] = entry
                    normalized.append(entry)
                    if headers[i][1] == None or headers[i][1] > entry:
                        headers[i][1] = entry
                    if headers[i][2] == None or headers[i][2] < entry:
                        headers[i][2] = entry
            car["raw"] = raw
            car["normalized"] = normalized
            items.append(car)


    for car in items:
        raw = car["normalized"] ## not yet processed
        normalized = {}
        for i in xrange(len(raw)):
            small = headers[i + 1][1]
            big = headers[i + 1][2]
            if small != big:
                data = (raw[i] - small) / (big - small)
            else:
                # print "skipped", headers[i]
                data = raw[i]
            normalized[headers[i + 1][0]] = data

        car["normalized"] = normalized

    f.write(json.dumps(items))
    f.write(";")
f.close()
