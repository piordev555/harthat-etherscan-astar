"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const plugins_1 = require("hardhat/plugins");
const undici_1 = require("undici");
const version_1 = require("../../../src/solc/version");
describe("solc version retrieval unit tests", function () {
    let realGlobalDispatcher;
    const mockAgent = new undici_1.MockAgent();
    before(function () {
        mockAgent.disableNetConnect();
        realGlobalDispatcher = (0, undici_1.getGlobalDispatcher)();
        (0, undici_1.setGlobalDispatcher)(mockAgent);
    });
    after(function () {
        (0, undici_1.setGlobalDispatcher)(realGlobalDispatcher);
    });
    it("solc version with commit is returned", async () => {
        const client = mockAgent.get("https://solc-bin.ethereum.org");
        client
            .intercept({
            path: "/bin/list.json",
            method: "GET",
        })
            .reply(200, {
            releases: {
                "0.5.1": "soljson-v0.5.1-commitsomething.js",
            },
        });
        const fullVersion = await (0, version_1.getLongVersion)("0.5.1");
        chai_1.assert.equal(fullVersion, "v0.5.1-commitsomething");
    });
    it("an exception is thrown if there was an error sending request", async () => {
        const client = mockAgent.get("https://solc-bin.ethereum.org");
        client.intercept({ path: "/bin/list.json", method: "GET" }).reply(404, {});
        return (0, version_1.getLongVersion)("0.5.1")
            .then(() => chai_1.assert.fail("Should fail when response has status 404."))
            .catch((error) => {
            chai_1.assert.instanceOf(error, plugins_1.HardhatPluginError);
            (0, chai_1.expect)(error.message)
                .to.be.a("string")
                .and.include("Failed to obtain list of solc versions.");
        });
    });
    it("an exception is thrown if the specified version doesn't exist", async () => {
        const client = mockAgent.get("https://solc-bin.ethereum.org");
        client
            .intercept({
            path: "/bin/list.json",
            method: "GET",
        })
            .reply(200, {
            releases: {
                "0.5.2": "soljson-v0.5.2-commitsomething.js",
            },
        });
        return (0, version_1.getLongVersion)("0.5.1")
            .then(() => chai_1.assert.fail("Should fail when response is missing the sought compiler version."))
            .catch((error) => {
            chai_1.assert.instanceOf(error, plugins_1.HardhatPluginError);
            (0, chai_1.expect)(error.message)
                .to.be.a("string")
                .and.include("Given solc version doesn't exist");
        });
    });
});
//# sourceMappingURL=version.js.map