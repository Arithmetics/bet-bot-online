// get games

// sportsbook-outcome-cell disabled -> disabled bets (dont send)

const ALLOWED_DEVALUEMENT = 2.1;

const BET_AMOUNT = "1.00";

const NBA_URL = "https://sportsbook.draftkings.com/leagues/basketball/nba";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLinesTable() {
  const table = document.querySelector(".sportsbook-table");
  if (
    table.querySelector(".sportsbook-table-header__title")?.innerText !==
    "TODAY"
  ) {
    return undefined;
  }
  return table;
}

function getTableRows() {
  const table = getLinesTable();
  return table?.querySelectorAll("tr") ?? [];
}

function convertHtmlLineToRaw(line) {
  const teamName = line?.querySelector(".event-cell__name-text")?.innerText;
  const element = line
    ?.querySelectorAll(".sportsbook-outcome-cell")?.[1]
    ?.querySelector(".sportsbook-outcome-cell__line");
  const totalLine = element?.innerText;

  const scoreString = line?.querySelector(".event-cell__score")?.innerText;
  const score = scoreString ? parseInt(scoreString) : 0;

  const time = line?.querySelector(".event-cell__time")?.innerText;
  const minute = time ? parseInt(time.split(":")[0]) : 12;
  const second = time ? parseInt(time.split(":")[1]) : 0;

  const period = line?.querySelector(".event-cell__period")?.innerText;

  const result = {
    teamName,
    score,
    minute,
    second,
    period,
    totalLine: totalLine ? parseFloat(totalLine) : 0,
    element,
  };
  return result;
}

function updateBetAmountInput(amount) {
  const betSlip = document.querySelector(".sportsbook__betslip");
  const input = betSlip.querySelector(".betslip-wager-box__input");
  input.value = amount;
}

async function completeBetInModal() {
  updateBetAmountInput(BET_AMOUNT);
  const betSlip = document.querySelector(".sportsbook__betslip");
  const placeBetButton = betSlip.querySelector(".dk-place-bet-button__wrapper");
  placeBetButton.click();
  await sleep(3000);

  if (
    betSlip.querySelector(".dk-betslip-receipt__header-row").innerText ===
    "BET PLACED"
  ) {
    const clearButton = betSlip.querySelector(".dk-betslip-header__clear-all");
    clearButton.click();

    return true; // return real amount...
  }

  // try again
  placeBetButton.click();
  await sleep(3000);

  if (
    betSlip.querySelector(".dk-betslip-receipt__header-row").innerText ===
    "BET PLACED"
  ) {
    const clearButton = betSlip.querySelector(".dk-betslip-header__clear-all");
    clearButton.click();

    return true;
  }

  // refresh page to clear any error states
  window.location.reload();
}

async function attemptTotalBet(
  awayTeamName,
  homeTeamName,
  totalLine,
  selection
) {
  const tableRows = getTableRows();
  const options = Array.from(tableRows).map((line) =>
    convertHtmlLineToRaw(line)
  );

  options.forEach((option) => {
    const lineDifference = Math.abs(option.totalLine - totalLine);
    const isStillValue = lineDifference < ALLOWED_DEVALUEMENT;
    const isCorrectRow =
      (selection === "over" && option.teamName === awayTeamName) ||
      (selection === "under" && option.teamName === homeTeamName);

    if (isStillValue && isCorrectRow) {
      option.element.click();
    }
  });

  // return await completeBetInModal();
}

function combineRawLinesToReal(rawLines) {
  const fullGames = [];
  let building = {
    awayTeam: "",
    homeTeam: "",
    totalLine: 0,
    score: 0,
  };

  for (let i = 0; i < rawLines.length; i++) {
    if (i % 2 === 0) {
      building.awayTeam = rawLines[i].teamName ?? "";
      building.awayTeamScore = rawLines[i].score ?? 0;
      building.totalLine = rawLines[i].totalLine ?? 0;
      building.period = rawLines[i].period ?? "";
      building.minute = rawLines[i].minute ?? 0;
      building.second = rawLines[i].second ?? 0;
    } else {
      building.homeTeam = rawLines[i].teamName ?? "";
      building.homeTeamScore = rawLines[i].score ?? 0;
      delete building.score;
      fullGames.push({
        ...building,
      });
    }
  }

  return fullGames;
}

function lineHasTeamData(line) {
  return line.teamName?.length > 1 && line.teamName?.length > 1;
}

let betsAreDirty = false;

async function makeBets(bets) {
  betsAreDirty = true;
  for (const bet of bets) {
    const betMade = await attemptTotalBet(
      bet.awayTeam,
      bet.homeTeam,
      bet.totalLine,
      bet.selection
    );
    if (betMade) {
      // await sendCompletedBetMessage(bet); // post to server
    }
  }

  betsAreDirty = false;
}

function alertBets(bets) {
  if (bets?.length) {
    console.log("Bets!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", bets);
  }
}

function navigateToLoginPage() {
  const loginButton = Array.from(
    document.querySelectorAll("[data-test-id='Log In-cta-link']")
  )[0];
  loginButton.click();
}

async function postGamesAndMakeBets(games) {
  fetch("http://localhost:8999/draftkings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ games }),
  })
    .then((response) => response.json())
    .then((json) => {
      alertBets(json.bets);
      makeBets(json.bets);
    });
}

// main loop

function loginIfLoggedOut() {
  const loginButton = Array.from(
    document.querySelectorAll("[data-test-id='Log In-cta-link']")
  )[0];
  if (loginButton) {
    navigateToLoginPage();
  }
}

function redirectToNba() {
  const loc = window.location.href;
  if (!loc === NBA_URL) {
    window.location.href = NBA_URL;
  }
}

function mainLoop() {
  // setTimeout(() => {
  //   loginIfLoggedOut();
  // }, 5000);
  redirectToNba();
  // dont interrupt betting
  if (!betsAreDirty) {
    const tableRows = getTableRows();
    const results = Array.from(tableRows).map((line) =>
      convertHtmlLineToRaw(line)
    );
    const realResults = results.filter((line) => lineHasTeamData(line));

    const foundGames = combineRawLinesToReal(realResults);
    console.log({
      foundGames,
    });
    postGamesAndMakeBets(foundGames);
  }
}

function refreshPage() {
  // dont interrupt betting
  if (!betsAreDirty) {
    window.location.reload();
  }
}

mainLoop();
setInterval(mainLoop, 1000 * 30);
setInterval(refreshPage, 1000 * 60 * 5);
