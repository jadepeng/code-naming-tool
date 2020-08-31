function formatVariable(queryStr) {
    let variables = queryStr.split(' ');
    for (let i = 1; i < variables.length; i++) {
        let word = variables[i];
        variables[i] = word.replace(word[0], word[0].toUpperCase());
    }
    return variables.join('');
}

function formatTranslationArr(arr) {
    if (!arr) {
        return null;
    }
    return arr.join(' ')
        .replace(/[!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '')
        .split(' ').filter(function (key, idx, inputArray) {
            return inputArray.indexOf(key) == idx && !/^(a|an|the)$/ig.test(key);
        }).join(' ');
}

function formatSuggestion(item){
    return `${item.name} <span class='tips'>代码库共出现${item.count}次 (相关搜索： <a target='_blank' href='https://unbug.github.io/codelf/#${item.name}'>codelf</a> &nbsp; <a target='_blank' href='https://searchcode.com/?q=${item.name}&lan=23'>searchcode</a>)</span>`;
}

$(document).ready(function () {

    var suggestions = document.getElementById("suggestions");
    var cnText = document.getElementById("cnText");
    var userinput = document.getElementById("userinput");
    userinput.addEventListener("input", show_results, true);

    var {
        index,
        data
    } = buildIndex()


    $("#suggestions").html("");
    
    $(cnText).on("keydown", function (e) {
        if (e.keyCode == 13) {
            translate(cnText, show_results)
        }
    });


    function show_results() {

        var value = this.value;

        var results = searchFromIndex(value)

        displayResult(results);
    }


    function createDefaultResult() {
        let entry = document.createElement("div")
        suggestions.appendChild(entry)
        entry.textContent = formatVariable(userinput.value)
        return entry
    }

    function translate(cnText, show_results) {
        let queryStr = $(cnText).val()
        $.getJSON(
            `https://fanyi.youdao.com/openapi.do?callback=?&keyfrom=Codelf&key=2023743559&type=data&doctype=jsonp&version=1.1&q=${queryStr}`,
            function (data) {
                let translation = ""
                if (data && data.translation) {
                    translation = formatTranslationArr(data.translation)
                }
                $(userinput).val(translation)
                show_results.apply(userinput)
            })
    }

    function buildIndex() {
        var index = new FlexSearch({
            encode: "advanced",
            tokenize: "reverse",
            suggest: true,
            cache: true
        })
        var data = []
        var i = 0
        for (var name in names) {
            var indexName = name.replace(/([A-Z])/g, " $1")
            data[i] = {
                "name": name,
                "count": names[name]
            }
            index.add(i++, indexName)
        }
        return {
            index,
            data
        }
    }

    function displayResult(results) {
        var entry, childs = suggestions.childNodes
        var i = 0,len = results.length
    
        for (; i < len; i++) {
            entry = childs[i]
            if (!entry) {
                entry = document.createElement("div")
                suggestions.appendChild(entry)
            }
            entry.innerHTML = formatSuggestion(results[i])
        }
    
        while (childs.length > len) {
            suggestions.removeChild(childs[i])
        }
    
        if (len == 0) {
            createDefaultResult()
        }
    }
    
    function searchFromIndex(value) {
        var results = index.search(value, 25)
    
        results = results.map(function (i) {
            return data[i]
        })
    
        results = results.sort(function (a, b) {
            return b.count - a.count
        })
        return results
    }
    
});

