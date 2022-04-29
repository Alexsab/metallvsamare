module Jekyll

  class DataPage < Page
    def initialize(site, base, dir = 'works', name)
      @site = site
      @base = base
      @dir = dir
      @name = name
      self.process(@name)
      self.data ||= {}
      # self.data['layout'] = 'single'
      # self.data['title'] = data['title']
    end
  end

  class CategoryPageGenerator < Generator
    def generate(site)
      works = site.data['works']
      works.each do |data|
        name = "#{data['uid']}.html"
        dir = data['categories'].split(',')
        page = Jekyll::DataPage.new(site, site.source, dir[0], name)
        page.data['layout'] = 'single'
        page.data['title'] = data['title']
        page.data['categories'] = data['categories']
        page.data['uid'] = data['uid']
        page.data['photo'] = data['photo']
        page.data['photos'] = data['photos']
        page.content = "This is #{data['uid']}"
        site.pages << page
      end
    end
  end

end