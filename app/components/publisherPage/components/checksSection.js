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

const additionalDataTooltips = {
  "Affiliations": "Affiliations<br/><br/>Percentage of content that includes affiliations in the metadata.<br/><br/><a href=\"https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/affiliations/\" target=\"_blank\">Where can I learn more?</a>",
  "ROR IDs": "ROR IDs<br/><br/>Percentage of content containing ROR IDs.<br/> These IDs enable users to precisely identify the works of a research organization.<br/><br/><a href=\"https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/affiliations/\" target=\"_blank\">Where can I learn more?</a>"
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
      additionalCoverageData: undefined,
      additionalTitleCoverageData: undefined,
      additionalCountsData: undefined,
    }
  }

  componentDidMount() {
    this.getTitleSearchData()
    this.startLoadingTimeout()
    this.setDateFilter(defaultDate, true)   //something's wrong here Setting the date filter here at this point causes the default filter not to switch properly sometimes

    window.addEventListener('resize', this.debouncedUpdate);

    this.fetchAdditionalData().then(data => this.setState({
      additionalCoverageData: data.message["coverage-type"],
      additionalCountsData: data.message["counts-type"]
    }));
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
      this.fetchAvailableTitleData(this.state.issnFilter).then(data => this.setState({ additionalTitleCoverageData: data.message["coverage-type"] }));
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
          filterError: !r.message.Coverage.length
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

  async fetchAdditionalData() {
    // Obtain additional data from the Crossref REST API (https://api.crossref.org/members/{memberId}).
    const response = await fetch(`https://api.crossref.org/members/${this.props.memberId}?mailto=support@crossref.org`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to fetch additional data.');
    }
    return data;
  }

  async fetchAvailableTitleData(issn) {
    // Obtain additional title data from the Crossref REST API (https://api.crossref.org/journals/{issn}).
    const response = await fetch(`https://api.crossref.org/journals/${issn}?mailto=support@crossref.org`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to fetch additional title data.');
    }
    return data;
  }

  addAdditionalCoverageData(data, dateFilter, contentFilter) {
    if (this.state.additionalCoverageData === undefined) return;

    // Determine json path for selected date filter.
    let datePath = "current";
    if (dateFilter === "All time") datePath = "all";
    else if (dateFilter === "Current content") datePath = "current";
    else if (dateFilter === "Back file") datePath = "backfile";

    let percentage;
    if (contentFilter === "Books") {
      // Content type Books is selected. Merge differently named book types.
      // Add coverage of affiliations.
      percentage = this.getBookPercentage(datePath, "affiliations");
      this.addAdditionalCoverageDataToDataset(data, "Affiliations", additionalDataTooltips['Affiliations'], percentage);
      // Add coverage of ROR IDs.
      percentage = this.getBookPercentage(datePath, "ror-ids");
      this.addAdditionalCoverageDataToDataset(data, "ROR IDs", additionalDataTooltips['ROR IDs'], percentage);
    } else {
      // Content type other than Books is selected.
      // Determine json path for selected content filter.
      let contentPath = "journal-article";
      if (contentFilter === "Journal articles") contentPath = "journal-article";
      else if (contentFilter === "Book chapters") contentPath = "book-chapter";
      else if (contentFilter === "Books") contentPath = "book";
      else if (contentFilter === "Conference papers") contentPath = "proceedings-article";
      else if (contentFilter === "Preprints") contentPath = "posted-content";
      else if (contentFilter === "Dissertations") contentPath = "dissertation";
      else if (contentFilter === "Datasets") contentPath = "dataset";

      // Add coverage of affiliations.
      percentage = this.state.additionalCoverageData[datePath][contentPath] === undefined ? 0 : Math.round(this.state.additionalCoverageData[datePath][contentPath]["affiliations"] * 100);
      this.addAdditionalCoverageDataToDataset(data, "Affiliations", additionalDataTooltips['Affiliations'], percentage);
      // Add coverage of ROR IDs.
      percentage = this.state.additionalCoverageData[datePath][contentPath] === undefined ? 0 : Math.round(this.state.additionalCoverageData[datePath][contentPath]["ror-ids"] * 100);
      this.addAdditionalCoverageDataToDataset(data, "ROR IDs", additionalDataTooltips['ROR IDs'], percentage);
    }
  }

  addAdditionalTitleCoverageData(data, dateFilter) {
    if (this.state.additionalTitleCoverageData === undefined) return;

    // Determine json path for selected date filter.
    let datePath = "current";
    if (dateFilter === "All time") datePath = "all";
    else if (dateFilter === "Current content") datePath = "current";
    else if (dateFilter === "Back file") datePath = "backfile";

    let percentage;
    // Add coverage of affiliations.
    percentage = Math.round(this.state.additionalTitleCoverageData[datePath].affiliations * 100);
    this.addAdditionalCoverageDataToDataset(data, "Affiliations", additionalDataTooltips['Affiliations'], percentage);
    // Add coverage of ROR IDs.
    percentage = Math.round(this.state.additionalTitleCoverageData[datePath]["ror-ids"] * 100);
    this.addAdditionalCoverageDataToDataset(data, "ROR IDs", additionalDataTooltips['ROR IDs'], percentage);
  }

  addAdditionalCoverageDataToDataset(data, elementName, tooltip, percentage) {
    // Add additionally obtained data to the existing data array.
    let item;
    item = data.find((element) => element.name === elementName);
    if (item === undefined) {
      data.push({ name: elementName, info: tooltip, percentage: percentage });
    } else {
      item = { name: elementName, info: tooltip, percentage: percentage };
    }
  }

  getBookPercentage(datePath, property) {
    // Merge differently named book types.
    // monograph.
    const monographTotal = this.state.additionalCountsData[datePath]['monograph'] === undefined ? 0 : this.state.additionalCountsData[datePath]['monograph'];
    const monographPropertyPercentage = this.state.additionalCoverageData[datePath]['monograph'] === undefined ? 0 : this.state.additionalCoverageData[datePath]['monograph'][property];
    const monographPropertyTotal = monographPropertyPercentage * monographTotal;
    // book.
    const bookTotal = this.state.additionalCountsData[datePath]['book'] === undefined ? 0 : this.state.additionalCountsData[datePath]['book'];
    const bookPropertyPercentage = this.state.additionalCoverageData[datePath]['book'] === undefined ? 0 : this.state.additionalCoverageData[datePath]['book'][property];
    const bookPropertyTotal = bookPropertyPercentage * bookTotal;
    // edited-book.
    const editedBookTotal = this.state.additionalCountsData[datePath]['edited-book'] === undefined ? 0 : this.state.additionalCountsData[datePath]['edited-book'];
    const editedBookPropertyPercentage = this.state.additionalCoverageData[datePath]['edited-book'] === undefined ? 0 : this.state.additionalCoverageData[datePath]['edited-book'][property];
    const editedBookPropertyTotal = editedBookPropertyPercentage * editedBookTotal;
    // reference-book.
    const referenceBookTotal = this.state.additionalCountsData[datePath]['reference-book'] === undefined ? 0 : this.state.additionalCountsData[datePath]['reference-book'];
    const referenceBookPropertyPercentage = this.state.additionalCoverageData[datePath]['reference-book'] === undefined ? 0 : this.state.additionalCoverageData[datePath]['reference-book'][property];
    const referenceBookPropertyTotal = referenceBookPropertyPercentage * referenceBookTotal;

    return Math.round((monographPropertyTotal + bookPropertyTotal + editedBookPropertyTotal + referenceBookPropertyTotal) / (monographTotal + bookTotal + editedBookTotal + referenceBookTotal) * 100);
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
      // console.log(logVal)
    }

    // Add coverage of missing metadata fields (affiliations and ROR IDs).
    if (this.state.issnFilter !== undefined && this.state.additionalTitleCoverageData !== undefined) {
      // A journal title is selected. Additional coverage data is retrieved from the Crossref REST API (https://api.crossref.org/members/{memberId}).
      if (titleChecksData) {
        this.addAdditionalTitleCoverageData(titleChecksData, this.state.dateFilter);
      }
    } else {
      // No journal title is selected. Additional coverage data is retrieved from the Crossref REST API (https://api.crossref.org/journals/{issn}).
      if (dateChecksData && dateChecksData[contentFilter]) {
        this.addAdditionalCoverageData(dateChecksData[contentFilter], this.state.dateFilter, contentFilter);
      }  else if (coverage[contentFilter]) {
        
        this.addAdditionalCoverageData(coverage[contentFilter], this.state.dateFilter, contentFilter);
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
