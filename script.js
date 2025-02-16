if (getData()) {
  display(getData());
  document.querySelector("#addSource").innerHTML = "Change Source";
  document.querySelector("#checkDuplicate").style.display = "inline-block";
} else {
  document.querySelector("#addSource").innerHTML = "Add Source";
  document.querySelector("#checkDuplicate").style.display = "none";
}

function addSource() {
  const text = document.getElementById("text").value;

  if (!text && getData()) {
    display(getData());
    return;
  }

  if (!text && !getData()) {
    window.alert("please add source!!");
    return;
  }

  const arrayStr = text.split("{");
  const generalArray = reFormatColorArray(arrayStr[0]);
  generalArray.pop();

  let lightArray = reFormatColorArray(arrayStr[1]);
  lightArray.pop();
  lightArray = subColor(lightArray);

  let darkArray = reFormatColorArray(arrayStr[2]);
  darkArray.pop();
  darkArray = subColor(darkArray);

  let summaryTheme = [];

  generalArray.map((general) => {
    summaryTheme.push({
      name: general.name,
      light: general.color,
      dark: "Both as one",
    });
  });

  lightArray.map((light) => {
    const darkIndex = darkArray.findIndex((d) => d.name === light.name);
    if (darkIndex > 0) {
      summaryTheme.push({
        name: light.name,
        light: light.color,
        dark: darkArray[darkIndex].color,
      });
      darkArray.splice(darkIndex, 1);
    } else {
      summaryTheme.push({
        name: light.name,
        light: light.color,
        dark: "No Color",
      });
    }
  });

  darkArray.map((dark) => {
    summaryTheme.push({
      name: dark.name,
      light: "No Color",
      dark: dark.color,
    });
  });
  setData(summaryTheme);
  let data = getData();
  display(data);
  document.querySelector("#addSource").innerHTML = "Change Source";
  document.querySelector("#checkDuplicate").style.display = "inline-block";
}

function reFormatColorArray(colorArr) {
  colorArr = colorArr
    .split(";")
    .filter((e) => e)
    .map((e) => e.replace("  ", "").replaceAll("\n", ""));
  let result = [];
  colorArr.map((color) => {
    const colorArrEle = color.split(": ");
    result.push({
      name: colorArrEle[0],
      color: colorArrEle[1],
    });
  });
  return result;
}

function display(data) {
  data = data.map((e) => {
    return `<tr><td><button onclick="copy(event,'${e.name}')">Copy</button>${e.name}</td><td>${e.light}</td><td>${e.dark}</td></tr>`;
  });
  const str = data.join("");
  document.querySelector("tbody").innerHTML = str;
}

function copy(event, value) {
  event.target.innerHTML = "Copied";
  event.target.style.background = "#b3ebb3";
  navigator.clipboard.writeText(value);
}

function filterColor() {
  let data = getData();
  let byName = document.querySelector("#name").value;
  let byLight = document.querySelector("#light").value;
  let byDark = document.querySelector("#dark").value;

  if (!byName && !byLight && !byDark) {
    let data = getData();
    if (!data) return;
    display(data);
    return;
  }

  if (byName) {
    data = data.filter((e, i) => {
      return e.name.toLowerCase().includes(byName);
    });
  }
  if (byLight) {
    data = data.filter((e) => {
      return e.light.toLowerCase().includes(byLight);
    });
  }
  if (byDark) {
    data = data.filter((e) => e.dark.toLowerCase().includes(byDark));
  }
  display(data);
}

function getData() {
  data = localStorage.getItem("data");
  return JSON.parse(data);
}
function setData(data) {
  localStorage.setItem("data", JSON.stringify(data));
}

function subColor(data) {
  return (data = data.map((e, i, arr) => {
    if (e.color.includes("var(")) {
      const name = e.color.replace("var(", "").replace(")", "");
      const found = arr.find((e) => e.name === name);
      if (!found) {
        e.color += "---Not found";
        return e;
      }
      e.color += "---" + found.color;
    }
    return e;
  }));
}

function checkDuplicate() {
  let data = getData();
  let result = [];
  let tempData = JSON.parse(JSON.stringify(data));
  while (tempData.length > 1) {
    const main = formatForCheckDuplicate({ ...tempData[0] });
    const founds = tempData.filter((e, i) => {
      e = formatForCheckDuplicate(e);
      if (main.light === e.light && main.dark === e.dark) {
        tempData.splice(i, 1);
        return true;
      } else {
        return false;
      }
    });
    if (founds.length > 1) result.push(founds);
  }
  displayForCheckDuplicate(result);
}

function formatForCheckDuplicate(obj) {
  obj.light =
    obj.light.includes("var(") && obj.light.includes("---")
      ? obj.light.split("---")[1]
      : obj.light;
  obj.dark =
    obj.dark.includes("var(") && obj.dark.includes("---")
      ? obj.dark.split("---")[1]
      : obj.dark;
  return obj;
}

function displayForCheckDuplicate(data) {
  data = data.map((e) => {
    let subStr = e.map(
      (k) =>
        `<tr><td><button onclick="copy(event,'${k.name}')">Copy</button>${k.name}</td><td>${k.light}</td><td>${k.dark}</td></tr>`
    );
    subStr += `<tr><td>===</td><td>===</td><td>===</td></tr>`;
    return subStr.replaceAll("</tr>,", "</tr>");
  });
  const str = data.join("");
  document.querySelector("tbody").innerHTML = str;
}
