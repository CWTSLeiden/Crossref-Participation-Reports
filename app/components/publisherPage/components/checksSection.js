import React, { Fragment } from 'react'
import is from 'prop-types'

import CheckBox from "./checkBox"
import ChecksFilter from "./checksFilter"
import { prettyKeys, debounce } from '../../../utilities/helpers'
import Search from "../../common/search"
import deployConfig from '../../../../deployConfig'
import TutorialOverlayPortal from './tutorialOverlayPortal'
import { contentFilterTutorial, titleSearchTutorial, dateFilterTutorial } from './tutorialDivs'

const translateDateFilter = {
  'All time': null,
  'Current content': 'current',
  'Back file': 'backfile'
}
const defaultContent = 'Journal articles'
const defaultDate = 'Current content'

const tooltips = {
  "version": "1.0",
  "checks": {
    "References": "References<br/><br/>Percentage of content items that include reference lists in their metadata.<br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00190\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00191\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00192\">How can I improve this score?</a>",
    "Open references": "Open references<br/><br/>Percentage of registered references that are set to be openly available via Crossref's APIs.<br/> If you’ve set your references to be open, they’re available to all users of all Crossref APIs and services.<br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00194\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00195\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00196\">How can I improve this score?</a>",
    "ORCID IDs": "ORCID IDs<br/><br/>Percentage of content containing ORCID IDs.<br/> These IDs enable users to precisely identify a researcher’s work - even when that researcher shares a name with someone else or if they change their name.<br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00198\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00199\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00200\">How can I improve this score?</a>",
    "Funder Registry IDs": "Funder Registry IDs<br/><br/>The percentage of registered content that contains the name and Funder Registry ID of at least one of the organizations that funded the research. <br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00202\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00203\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00204\">How can I improve this score?</a>",
    "Funding award numbers": "Funding award numbers<br/><br/>The percentage of registered content that contains at least one funding award number - a number assigned by the funding organization to identify the specific piece of funding (the award or grant). <br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00206\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00207\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00208\">How can I improve this score?</a>",
    "Crossmark enabled": "Crossmark enabled<br/><br/>Percentage of content using the Crossmark service, which gives readers quick and easy access to the current status of a piece of content - whether it’s been updated, corrected or retracted. <br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00210\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00211\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00212\">How can I improve this score?</a>",
    "Text mining URLs": "Text mining URLs<br/><br/>The percentage of registered content containing full text URLs in the metadata to help researchers easily locate your content for text and data mining.<br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00214\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00215\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00216\">How can I improve this score?</a>",
    "License URLs": "License URLs<br/><br/>The percentage of registrations that contain URLs that point to a license that explains the terms and conditions under which readers can access content.<br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00218\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00219\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00220\">How can I improve this score?</a>",
    "Similarity Check URLs": "Similarity Check URLs<br/><br/>The percentage of content registered that includes Similarity Check URLs, enabling iThenticate to index the content and you to use the Similarity Check service and efficiently check your content for plagiarism. <br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00222\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00223\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00224\">How can I improve this score?</a>",
    "Abstracts": "Abstracts<br/><br/>Percentage of content that includes the abstract in the metadata, giving further insights into the content of the work.<br/><br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00226\">Why is this important?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00227\">Where can I learn more?<br/><a href=\"https://www.crossref.org/education/metadata-stewardship/reports/participation-reports#00228\">How can I improve this score?</a>",
    "Author affiliations": "Author affiliations<br/><br/>Percentage of content that includes the author affiliations in the metadata, giving further insights into the content of the work.<br/><br/><a href=\"https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/affiliations/\" target=\"_blank\">Affiliations and ROR</a>",
    "ROR IDs": "ROR IDs<br/><br/>Percentage of content containing ROR IDs.<br/> These IDs enable users to precisely identify a research organization.<br/><br/><a href=\"https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/affiliations/\" target=\"_blank\">Affiliations and ROR</a>"
  }
}

export default class ChecksSection extends React.Component {

  static propTypes = {
    coverage: is.object.isRequired,
    memberId: is.string.isRequired,
    loadingChecks: is.bool.isRequired,
    setTotals: is.func.isRequired,
    totals: is.object.isRequired,
    filterTotals: is.object.isRequired
  }


  constructor() {
    super()
    this.generateKey = (contentFilter, dateFilter, titleFilter) => {
      return `${contentFilter}-${dateFilter}${titleFilter ? `-${titleFilter}` : ''}`
    }

    this.state = {
      openTooltip: undefined,
      contentFilter: defaultContent,
      dateFilter: defaultDate,
      titleFilter: undefined,
      issnFilter: undefined,
      titleSearchList: [],
      titleChecksData: undefined,
      dateChecksData: undefined,
      loadingFilter: false,
      loadingStage: 0,
      keySig: this.generateKey(defaultContent, defaultDate),
      coverageError: false,
      filterError: false,
      tutorialOverlay: false,
      tutorialOverlayFadeIn: false,
      additionalData: undefined,
      additionalTitleData: undefined,
      additionalCountsType: undefined,
    }
  }


  componentDidMount() {
    this.getTitleSearchData()
    this.startLoadingTimeout()
    this.setDateFilter(defaultDate, true)   //something's wrong here Setting the date filter here at this point causes the default filter not to switch properly sometimes

    window.addEventListener('resize', this.debouncedUpdate);
    this.fetchAvailableData().then(data => this.setState({
      additionalData: data.message["coverage-type"],
      additionalCountsType: data.message["counts-type"]
    }));

  }

  async fetchAvailableData() {
    //Obtain additional data from api.crossref.org.
    console.log(`https://api.crossref.org/members/${this.props.memberId}`);
    const response = await fetch(`https://api.crossref.org/members/${this.props.memberId}`);
    const resData = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch extra data');
    }
    //console.log("resdata: " + resData);
    return resData;
  }
  async fetchAvailableTitleData(issn) {
    //Obtain additional data from api.crossref.org.
    console.log(`https://api.crossref.org/journals/${issn}`);
    const response = await fetch(`https://api.crossref.org/journals/${issn}`);
    const resData = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch extra title data');
    }
    //console.log("resdata: " + resData);
    return resData;
  }

  getTitleSearchData = (contentFilter = defaultContent) => {
    fetch(`${deployConfig.apiBaseUrl}?op=publications&memberid=${this.props.memberId}&contenttype=${contentFilter}`)
      .then(r => r.json())
      .then(r => this.setState({ titleSearchList: r.message }))
      .catch(e => {
        console.error(e)
      })
  }


  startLoadingTimeout = () => {
    clearTimeout(this.loadingTimeout)
    this.loadingTimeout = setTimeout(() => {
      this.setState({ loadingStage: 1 })
    }, 1000)
  }


  debouncedUpdate = () => {
    debounce(() => this.setState({}), 500, this)
  }


  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedUpdate);
  }


  componentDidUpdate(prevProps, prevState) {
    if (!prevState.tutorialOverlay && this.state.tutorialOverlay) {
      this.setState({ tutorialOverlayFadeIn: true })
    }
    if (prevState.tutorialOverlay && !this.state.tutorialOverlay) {
      this.setState({ tutorialOverlayFadeIn: false })
    }

    if (prevState.issnFilter !== this.state.issnFilter && this.state.issnFilter) {
      //Obtain additional data
      this.fetchAvailableTitleData(this.state.issnFilter).then(data => this.setState({ additionalTitleData: data.message["coverage-type"] }));
    }
  }


  componentWillReceiveProps(nextProps) {
    if (!nextProps.loadingChecks && this.props.loadingChecks) {
      clearTimeout(this.loadingTimeout)
      this.setState({ loadingStage: 0 })
    }

  }


  setFilter = (contentFilter) => {
    this.setState(prevState => ({
      contentFilter,
      titleFilter: undefined,
      issnFilter: undefined,
      titleChecksData: undefined,
      keySig: this.generateKey(contentFilter, prevState.dateFilter),
      filterError: translateDateFilter[prevState.dateFilter]
        ? !prevState.dateChecksData[contentFilter]
        : false
    }))
  }


  setDateFilter = (filterName, updateDefaultFilter = false) => {
    const dateQuery = translateDateFilter[filterName]
    const baseApiUrl = `${deployConfig.apiBaseUrl}?op=participation-summary`
    const member = `&memberid=${this.props.memberId}`
    const pubyear = dateQuery ? `&pubyear=${dateQuery}` : ''
    const pubid = this.state.titleFilter ? `&pubid=${this.state.issnFilter}` : ''
    this.setState({ dateFilter: filterName, loadingFilter: !!(pubid || dateQuery) })
    this.startLoadingTimeout()

    if (pubid) {
      fetch(baseApiUrl + member + pubyear + pubid)
        .then(r => r.json())
        .then(r => {
          clearTimeout(this.loadingTimeout)

          this.setState(prevState => ({
            titleChecksData: r.message.Coverage,
            loadingFilter: false,
            loadingStage: 0,
            keySig: this.generateKey(prevState.contentFilter, filterName, prevState.titleFilter),
            filterError: !r.message.Coverage.length
          }))
        })
        .catch(e => {
          console.error(e)
          clearTimeout(this.loadingTimeout)
          this.setState({ loadingStage: 0, loadingFilter: false, filterError: true })
        })
    }

    if (dateQuery) {
      fetch(baseApiUrl + member + pubyear)
        .then(r => r.json())
        .then(r => {
          clearTimeout(this.loadingTimeout)
          this.props.setTotals(r.message.totals)
          this.setState(prevState => {
            const newState = { dateChecksData: r.message.Coverage }

            if (!Object.keys(newState.dateChecksData).length) {
              newState.filterError = true
              newState.loadingFilter = false
              newState.loadingStage = 0
              return newState
            }

            if (!pubid) {
              newState.contentFilter = prevState.contentFilter
              if (updateDefaultFilter && !newState.dateChecksData[prevState.contentFilter]) {
                const newFilter = Object.keys(newState.dateChecksData)[0]
                newState.contentFilter = newFilter
              }

              newState.loadingFilter = false
              newState.loadingStage = 0
              newState.keySig = this.generateKey(newState.contentFilter, filterName)
              newState.filterError = !r.message.Coverage[newState.contentFilter]
            }
            return newState
          })
        })
        .catch(e => {
          console.error(e)

          if (!pubid) {
            clearTimeout(this.loadingTimeout)
            this.setState({
              loadingFilter: false,
              loadingStage: 0,
              filterError: true
            })
          }
        })

    } else {
      clearTimeout(this.loadingTimeout)
      this.props.setTotals(this.props.totals)
      this.setState(prevState => ({
        dateChecksData: undefined,
        loadingFilter: false,
        loadingStage: 0,
        keySig: pubid ? prevState.keySig : this.generateKey(prevState.contentFilter, filterName, prevState.titleFilter),
        filterError: !this.props.coverage[prevState.contentFilter]
      }))
    }
  }


  selectTitleFilter = (value, selection) => {
    const issn = selection.pissn ? selection.pissn : selection.eissn
    this.setState({ titleFilter: value, loadingFilter: true, issnFilter: issn })
    this.startLoadingTimeout()

    const dateQuery = translateDateFilter[this.state.dateFilter]

    const baseApiUrl = `${deployConfig.apiBaseUrl}?op=participation-summary`
    const member = `&memberid=${this.props.memberId}`
    const pubyear = dateQuery ? `&pubyear=${dateQuery}` : ''
    const pubid = `&pubid=${issn}`
    fetch(baseApiUrl + member + pubyear + pubid)
      .then(r => r.json())
      .then(r => {
        clearTimeout(this.loadingTimeout)

        this.setState(prevState => ({
          titleChecksData: r.message.Coverage,
          loadingFilter: false,
          loadingStage: 0,
          keySig: this.generateKey(prevState.contentFilter, prevState.dateFilter, value),
          filterError: !r.message.Coverage.length,
        }))
      })
      .catch(e => {
        console.error(e)
        clearTimeout(this.loadingTimeout)
        this.setState({ loadingFilter: false, loadingStage: 0, filterError: true })
      })
  }


  cancelTitleFilter = () => {
    function focusInput() {
      document.querySelector('.searchInput').focus()
    }

    this.setState(prevState => {
      const newState = {}

      if (prevState.dateChecksData && !prevState.dateChecksData[prevState.contentFilter]) {
        newState.filterError = true
      }

      newState.titleFilter = undefined
      newState.issnFilter = undefined
      newState.titleChecksData = undefined
      newState.keySig = this.generateKey(prevState.contentFilter, prevState.dateFilter)

      return newState
    }, focusInput)
  }


  setOpenTooltip = (selection) => {
    this.setState(prevState => prevState.openTooltip === selection ? null : { openTooltip: selection })
  }


  renderLoader = () => {
    return (
      <Fragment>
        <div style={!this.state.coverageError ? { top: 0 } : null} className="loadWhiteScreen" />

        {this.state.loadingStage === 1 &&
          <div className="loadingStage1">
            <img
              className="loadThrobber"
              style={{ height: '60px' }}
              src={`${deployConfig.baseUrl}assets/images/Asset_Load_Throbber_Load Throbber Teal.svg`} />

            <p className="pleaseWait">Please wait, we are collecting your data.</p>
          </div>}

      </Fragment>
    )
  }


  renderFilters = (tutorialOverlay) => {
    const { contentFilter, titleFilter, titleSearchList, dateChecksData } = this.state
    const { coverage } = this.props

    return (
      <div className="filters">

        <ChecksFilter
          label={'Content type'}
          filters={Object.keys(dateChecksData ? dateChecksData : coverage)}
          currentFilter={contentFilter}
          setFilter={this.setFilter}
          tutorial={tutorialOverlay ? contentFilterTutorial : undefined}
        />

        <div className="publicationFilterContainer">
          <div
            className={
              `filter publicationFilter ${titleFilter ? 'titleFilterActive' : ''} ${this.state.contentFilter !== 'Journal articles' ? 'inactivePublicationFilter' : ''}`
            }
            onClick={titleFilter ? this.cancelTitleFilter : null}
          >

            {titleFilter
              ? <Fragment>
                <div className="titleFilterText">
                  {titleFilter}
                </div>

                <img
                  className="titleFilterX"
                  src={`${deployConfig.baseUrl}assets/images/Asset_Icons_White_Close.svg`} />
              </Fragment>

              : <Search
                searchList={titleSearchList}
                placeHolder="Search by title"
                onSelect={this.selectTitleFilter}
                addWidth={2}
                notFound="Not found in this content type" />}

            {tutorialOverlay && titleSearchTutorial}
          </div>
        </div>


        <div className="timeFilterContainer">
          <ChecksFilter
            className="timeFilter"
            label={"Publication date"}
            filters={Object.keys(translateDateFilter)}
            currentFilter={this.state.dateFilter}
            setFilter={this.setDateFilter}
            tutorial={tutorialOverlay ? dateFilterTutorial : undefined}
          >
            <img className="filterIcon" src={`${deployConfig.baseUrl}assets/images/Asset_Icons_Grey_Calandar.svg`} />
          </ChecksFilter>
        </div>

      </div>
    )
  }

  calculateBookPercentage(datePath, property) {
    //Aggregate differently named book types
    //monograph
    const monographTotal = this.state.additionalCountsType[datePath]['monograph'] === undefined ? 0 : this.state.additionalCountsType[datePath]['monograph'];
    const monographPercentageWithProperty = this.state.additionalData[datePath]['monograph'] === undefined ? 0 : this.state.additionalData[datePath]['monograph'][property];
    const monographTotalWithProperty = monographPercentageWithProperty * monographTotal;
    //book
    const bookTotal = this.state.additionalCountsType[datePath]['book'] === undefined ? 0 : this.state.additionalCountsType[datePath]['book'];
    const bookPercentageWithProperty = this.state.additionalData[datePath]['book'] === undefined ? 0 : this.state.additionalData[datePath]['book'][property];
    const bookTotalWithProperty = bookPercentageWithProperty * bookTotal;
    //edited-book
    const editedBookTotal = this.state.additionalCountsType[datePath]['edited-book'] === undefined ? 0 : this.state.additionalCountsType[datePath]['edited-book'];
    const editedBookPercentageWithProperty = this.state.additionalData[datePath]['edited-book'] === undefined ? 0 : this.state.additionalData[datePath]['edited-book'][property];
    const editedBookTotalWithProperty = editedBookPercentageWithProperty * editedBookTotal;
    //reference-book
    const referenceBookTotal = this.state.additionalCountsType[datePath]['reference-book'] === undefined ? 0 : this.state.additionalCountsType[datePath]['reference-book'];
    const referenceBookPercentageWithProperty = this.state.additionalData[datePath]['reference-book'] === undefined ? 0 : this.state.additionalData[datePath]['reference-book'][property];
    const referenceBookTotalWithProperty = referenceBookPercentageWithProperty * referenceBookTotal;

    const bookPercentage = Math.round((monographTotalWithProperty + bookTotalWithProperty + editedBookTotalWithProperty + referenceBookTotalWithProperty) / (monographTotal + bookTotal + editedBookTotal + referenceBookTotal) * 100);
    //console.log(bookPercentage);
    return bookPercentage;
  }
  addToDataset(data, elementName, tooltip, percentage) {
    //Merge additionally obtained data with the existing data array.
    let item;
    item = data.find((element) => element.name === elementName);
    if (item === undefined) {
      data.push({ name: elementName, info: tooltip, percentage: percentage });
    } else {
      item = { name: elementName, info: tooltip, percentage: percentage };
    }
  }
  addAdditionalData(data, dateFilter, contentFilter) {
    //Select correct json path for selected date value (All time|Current content|Back file)
    let datePath = "current";
    switch (dateFilter) {
      case "All time":
        datePath = "all"
        break;
      case "Current content":
        datePath = "current"
        break;
      case "Back file":
        datePath = "backfile"
        break;
      default:
        datePath = "current";
        break;
    }

    let percentage;

    if (contentFilter === "book") {
      //Special case. Aggregate differently named book types first.
      //Affiliations
      percentage = this.calculateBookPercentage(datePath, "affiliations");
      this.addToDataset(data, "Affiliations", tooltips.checks['Author affiliations'], percentage);
      //ROR IDs
      percentage = this.calculateBookPercentage(datePath, "ror-ids");
      this.addToDataset(data, "ROR IDs", tooltips.checks['ROR IDs'], percentage);

      //Debug:
      // console.log("book: " + percentage);
      // console.log("ORCID IDs: " + this.calculateBookPercentage(datePath, "orcids")); //Reference existing values to check aggregation
      // console.log("References: " + this.calculateBookPercentage(datePath, "references")); //Reference existing values to check aggregation
    }
    else {
      //Affiliations
      percentage = this.state.additionalData[datePath][contentFilter] === undefined ? 0 : Math.round(this.state.additionalData[datePath][contentFilter].affiliations * 100);
      this.addToDataset(data, "Affiliations", tooltips.checks['Author affiliations'], percentage);
      //ROR IDs
      percentage = this.state.additionalData[datePath][contentFilter] === undefined ? 0 : Math.round(this.state.additionalData[datePath][contentFilter]["ror-ids"] * 100);
      this.addToDataset(data, "ROR IDs", tooltips.checks['ROR IDs'], percentage);
    }
  }

  addAdditionalTitleData(data, dateFilter) {
    //Select correct json path for selected date value (All time|Current content|Back file)
    let datePath = "current";
    switch (dateFilter) {
      case "All time":
        datePath = "all"
        break;
      case "Current content":
        datePath = "current"
        break;
      case "Back file":
        datePath = "backfile"
        break;
      default:
        datePath = "current";
        break;
    }
    let percentage;

    //Affiliations
    percentage = Math.round(this.state.additionalTitleData[datePath].affiliations * 100);
    this.addToDataset(data, "Affiliations", tooltips.checks['Author affiliations'], percentage);
    //ROR IDs
    percentage = Math.round(this.state.additionalTitleData[datePath]["ror-ids"] * 100);
    this.addToDataset(data, "ROR IDs", tooltips.checks['ROR IDs'], percentage);
  }

  render() {
    const { contentFilter, titleChecksData, dateChecksData, tutorialOverlay, tutorialOverlayFadeIn } = this.state
    const { coverage } = this.props
    const totals = this.props.filterTotals
    {
      var logVal = {
        titleChecksData: titleChecksData,
        dateChecksData: dateChecksData,
        contentFilter: contentFilter,
        coverage: coverage,
        filterError: this.state.filterError,
        coverageError: this.state.coverageError
      }
      //console.log(logVal)
    }

    let pathFilter = ""; //Map selected content type to corresponding json property.
    if (contentFilter === "Journal articles") { pathFilter = "journal-article" }
    if (contentFilter === "Book chapters") { pathFilter = "book-chapter" }
    if (contentFilter === "Books") { pathFilter = "book" }
    if (contentFilter === "Conference papers") { pathFilter = "proceedings-article" }
    if (contentFilter === "Preprints") { pathFilter = "posted-content" }
    if (contentFilter === "Dissertations") { pathFilter = "dissertation" }
    if (contentFilter === "Datasets") { pathFilter = "dataset" }

    //Add missing values to the dataset.
    if (this.state.issnFilter !== undefined && this.state.additionalTitleData !== undefined) {
      //A journal title is selected. Additional data is retrieved from https://api.crossref.org/journals/{issn}
      if (titleChecksData) {
        this.addAdditionalTitleData(titleChecksData, this.state.dateFilter);
      }
    }
    else {
      //No journal title is selected. Additional data is retrieved from https://api.crossref.org/members/{memberId}
      if (dateChecksData && dateChecksData[contentFilter]) {
        this.addAdditionalData(dateChecksData[contentFilter], this.state.dateFilter, pathFilter);
      } else if (coverage[contentFilter]) {
        this.addAdditionalData(coverage[contentFilter], this.state.dateFilter, pathFilter);
      } else if (titleChecksData) {
        this.addAdditionalTitleData(titleChecksData, this.state.dateFilter);
      }
    }

    return (
      <div className="checksSection">
        <div className="titleBar">
          {`Content type: ${prettyKeys(contentFilter)}`}

          <div className="tutorialIconContainer">
            <img
              src={`${deployConfig.baseUrl}assets/images/Asset_Icons_Lighter_Grey_Help.svg`}
              className="tutorialIcon"
              tabIndex="-1"
              onBlur={() => this.setState({ tutorialOverlay: false })}
              onMouseDown={() => this.setState(prevState => ({ tutorialOverlay: !prevState.tutorialOverlay }))} />
          </div>
        </div>
        <div className="totals">
          {Object.keys(totals).map((key) =>
            totals[key]
              ? <p key={key}>{prettyKeys(key)} <span>{totals[key].toLocaleString()}</span></p>
              : null
          )}
        </div>
        {this.renderFilters()}

        {this.state.coverageError || this.state.filterError
          ? <div className="coverageError">
            {this.renderLoader()}
            {this.state.coverageError
              ? <div>No content has been registered for this member.</div>
              : <div className="filterError">
                <p>No content registered for the selected date range.</p>
                <b>Select another date range.</b>
              </div>}
          </div>

          : <Fragment>
            {this.props.loadingChecks

              ? <div className="checksWidthContainer">
                {this.renderLoader()}

                <div className="checksContainer">

                  {blankChecks.map((item, index) =>
                    <CheckBox key={index} item={item} setOpenTooltip={this.setOpenTooltip} blank={true} />
                  )}
                </div>
              </div>

              : <div className="checksWidthContainer">
                {this.state.loadingFilter && this.renderLoader()}

                <div className="checksContainer">
                  {/* {console.log(coverage[contentFilter])} */}
                  {(titleChecksData || (dateChecksData && dateChecksData[contentFilter]) || coverage[contentFilter]) &&
                    (titleChecksData || (dateChecksData && dateChecksData[contentFilter]) || coverage[contentFilter]).map(item =>
                      <CheckBox
                        key={`${this.state.keySig}-${item.name}`}
                        item={item}
                        openTooltip={this.state.openTooltip}
                        setOpenTooltip={this.setOpenTooltip}
                      />
                    )}
                </div>
              </div>
            }
          </Fragment>
        }

        <div className={`tutorialOverlay ${tutorialOverlayFadeIn ? 'tutorialFadeIn' : ''}`}>
          <div className="tutorialBackground" />
          {this.renderFilters(tutorialOverlay)}
          <div className="clickBlocker" />
        </div>
      </div>
    )
  }
}

const bc = { name: '', percentage: 0, info: '' }
const blankChecks = [bc, bc, bc, bc, bc, bc, bc, bc, bc, bc, bc, bc]
