# Portal navigation groups

The supplied NIC `master.js` builds three kinds of navigation destinations. The reference inventory records the snapshot and hash. The header's optional groups map these structures to semantic links and native disclosures.

| Source | Observed behavior | Nasaq implementation |
| --- | --- | --- |
| JS 627–714 | The site sorts its menu data, filters visibility and determines a current ancestor from the location and stored click history. A leaf destination renders a link. | The application supplies ordered, visible destinations and an explicit current page. A simple destination renders its existing anchor. |
| JS 715–765 | A grouped dropdown contains titled columns of third-level links. A compact dropdown flattens the visible destinations. Each top-level item has a target URL. | A `groups` array produces one disclosure. Supply multiple titled groups for columns or a single unnamed group for a flat list. An overview link retains the top-level URL. |
| JS 853–925 | The mobile toggle opens the menu. Following a destination, clicking the overlay or clicking outside closes navigation. Nested dropdown triggers are distinct from destinations. | The header uses a button for its mobile menu and a native summary for each branch. Escape closes the branch first and returns focus to its summary. Dismissing the outer mobile menu then restores focus to its toggle. |
| JS 733–765 | Optional images decorate item labels. The supplied CSS does not define the Bootstrap dropdown panel dimensions. | Groups use ordinary text and Nasaq tokens. Panel spacing, elevation and columns are Nasaq design choices. No site artwork is required. |

The current descendant highlights the parent summary. Only an actual destination link receives `aria-current="page"`. Identical labels can safely appear in separate headers. Routing, authorization, session storage and the decision to show a destination belong to the application.

The [PortalHeader guide](https://mohamedembarak.github.io/nasaq/#component/portal-header) contains a flat link, grouped services and an unnamed support group. Its examples run inside the guide preview and retain the site's verification disclosure above the header.
