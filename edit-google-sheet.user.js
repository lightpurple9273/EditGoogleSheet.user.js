// ==UserScript==
// @name         Edit Google Sheet as specified in sessionStorage
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Edit Google Sheet as specified in sessionStorage
// @author       lightpurple9273😼
// @match        https://docs.google.com/spreadsheets/d/*
// @grant        none
// @require      https://gist.github.com/lightpurple9273/e6a1764f37787a14b8e80399a73575e1/raw/8ca433d54a386e70f324f2a4da9d6c38e0552c0a/googleSheetHelperFuncs.user.js
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = "sessionStorageKeyAu7f9WpB0qz1LmCsT5vJh8Re2KdyA3Nb";

    class EditGoogleSheet {
        constructor(storageKey) {
            this.storageKey = storageKey;
            this.timerId = null;
        }

        start() {
            if (this.timerId !== null) return; // Already running
            this.timerId = setInterval(() => this.checkCommands(), 1000);
            console.log("🟢 EditGoogleSheet started.");
        }

        stop() {
            if (this.timerId !== null) {
                clearInterval(this.timerId);
                this.timerId = null;
                console.log("🛑 EditGoogleSheet stopped (no more commands).");
            }
        }

        parseCommand(cmd) {
            const match = cmd.match(/^write\s+([A-Z]+\d+)\s+(.+)$/i);
            if (!match) return null;
            return { type: "write", cell: match[1].toUpperCase(), value: match[2] };
        }

        executeCommand(parsed) {
            if (!parsed) {
                console.warn("🛑 Invalid command. Skipping.");
                return;
            }

            switch (parsed.type) {
                case "write":
                    //this.writeToCell(parsed.cell, parsed.value);
                    console.log("writeToCell"+parsed.cell+parsed.value);
                    setCellValue(parsed.cell, parsed.value, false)
                    break;
                default:
                    console.warn(`🛑 Unknown command type: ${parsed.type}`);
            }
        }

        checkCommands() {
            const raw = sessionStorage.getItem(this.storageKey);
            if (!raw) {
                this.stop();
                return;
            }

            let commands;
            try {
                commands = JSON.parse(raw);
                if (!Array.isArray(commands)) {
                    console.warn("🛑 Commands must be an array.");
                    sessionStorage.removeItem(this.storageKey);
                    this.stop();
                    return;
                }
            } catch (e) {
                console.error("🛑 Failed to parse sessionStorage:", e);
                sessionStorage.removeItem(this.storageKey);
                this.stop();
                return;
            }

            if (commands.length === 0) {
                sessionStorage.removeItem(this.storageKey);
                this.stop();
                return;
            }

            const cmd = commands.shift();
            const parsed = this.parseCommand(cmd);
            this.executeCommand(parsed);

            if (commands.length > 0) {
                sessionStorage.setItem(this.storageKey, JSON.stringify(commands));
            } else {
                sessionStorage.removeItem(this.storageKey);
                this.stop();
            }
        }
    }

    // Create an instance and start it
    const editGoogleSheet = new EditGoogleSheet(STORAGE_KEY);

    function waitForNameBoxThenExecute() {
        const nameBox = document.querySelector('[aria-label="Name box (Ctrl + J)"] input');
        if (nameBox) {
            setTimeout(editGoogleSheet.start, 500);
        } else {
            console.log("Waiting for name box...");
            setTimeout(waitForNameBoxThenExecute, 500);
        }
    }

    window.addEventListener("load", () => {
        waitForNameBoxThenExecute();
    });


})();

