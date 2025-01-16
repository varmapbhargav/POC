import { bootstrap } from "@libp2p/bootstrap";
import { enrTree, wakuDnsDiscovery } from "@waku/discovery";
import { LightNode } from "@waku/interfaces";
import { createLightNode } from "@waku/sdk";
import { expect } from "chai";

import {
  afterEachCustom,
  makeLogFileName,
  ServiceNode,
  tearDownNodes
} from "../src/index.js";

describe("Use static and several ENR trees for bootstrap", function () {
  let waku: LightNode;
  let nwaku: ServiceNode;

  afterEachCustom(this, async () => {
    await tearDownNodes(nwaku, waku);
  });

  it("", async function () {
    this.timeout(10_000);

    nwaku = new ServiceNode(makeLogFileName(this));
    await nwaku.start();
    const multiAddrWithId = await nwaku.getMultiaddrWithId();

    const NODE_REQUIREMENTS = {
      store: 3,
      lightPush: 3,
      filter: 3
    };

    waku = await createLightNode({
      libp2p: {
        peerDiscovery: [
          bootstrap({ list: [multiAddrWithId.toString()] }),
          wakuDnsDiscovery(
            [enrTree["SANDBOX"], enrTree["TEST"]],
            NODE_REQUIREMENTS
          )
        ]
      }
    });
    await waku.start();

    const peersDiscovered = await waku.libp2p.peerStore.all();

    // 3 from DNS Disc, 1 from bootstrap
    expect(peersDiscovered.length).to.eq(3 + 1);
    // should also have the bootstrap peer
    expect(
      peersDiscovered.find(
        (p) => p.id.toString() === multiAddrWithId.getPeerId()?.toString()
      )
    ).to.not.be.undefined;
  });
});
